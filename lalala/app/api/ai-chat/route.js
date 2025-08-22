//api/ai-chat/route.js

import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY})

// --- helper to safely parse JSON ---
function safeJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    // try to fix common mistakes (unquoted keys, trailing commas)
    const fixed = str
      .replace(/(\w+):/g, '"$1":')        // wrap unquoted keys
      .replace(/,(\s*[}\]])/g, "$1")      // remove trailing commas
    try {
      return JSON.parse(fixed)
    } catch {
      return { message: str, tasks: [] }
    }
  }
}

// --- helper to detect if user is asking for existing task info ---
function isQueryingExistingTasks(message) {
  const queryKeywords = [
    'show', 'find', 'search', 'get', 'what', 'which', 'where', 'when',
    'status of', 'progress', 'update on', 'assigned to', 'who is',
    'how many', 'list', 'display', 'tell me about', 'info about',"show","taskStatus","is"
  ]
  
  const messageLower = message.toLowerCase()
  return queryKeywords.some(keyword => messageLower.includes(keyword))
}

// --- helper to get the correct base URL ---
function getBaseUrl(request) {
  // First try environment variable
  if (process.env.NEXT_AUTH_BASE_URL && !process.env.NEXT_AUTH_BASE_URL.includes('127.0.0.1') && !process.env.NEXT_AUTH_BASE_URL.includes('localhost')) {
    return process.env.NEXT_AUTH_BASE_URL
  }
  
  // Fallback to request headers
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  if (host) {
    return `${protocol}://${host}`
  }
  
  // Last resort - but this might not work in all environments
  return process.env.NEXT_AUTH_BASE_URL || 'http://localhost:3000'
}

// --- helper to perform RAG search with authentication ---
async function performRAGSearch(query, request, projectId) {
  try {
    const baseUrl = getBaseUrl(request)
    
    // Forward cookies from the original request
    const cookies = request.headers.get('cookie')

    console.log('[RAG Search] Using base URL:', baseUrl)
    console.log('[RAG Search] Project ID:', projectId)
    
    const searchUrl = `${baseUrl}/api/tasks/search/${projectId}?query=${encodeURIComponent(query)}`
    console.log('[RAG Search] Full URL:', searchUrl)
    
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Cookie': cookies || '',
          'Content-Type': 'application/json',
          'User-Agent': 'internal-api-call'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('[RAG Search] Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[RAG Search] Error response:', errorText)
        
        if (response.status === 404) {
          return null // No matching tasks found
        }
        if (response.status === 401) {
          throw new Error('Authentication required')
        }
        throw new Error(`RAG search failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('[RAG Search] Success:', result)
      return result
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
    
  } catch (error) {
    console.error('[RAG Search Error]:', {
      message: error.message,
      name: error.name,
      code: error.code,
      cause: error.cause
    })
    
    // Re-throw authentication errors so they can be handled properly
    if (error.message === 'Authentication required') {
      throw error
    }
    
    // Handle specific connection errors
    if (error.code === 'ECONNREFUSED') {
      console.error('[RAG Search] Connection refused - server may not be accessible at the configured URL')
    }
    
    if (error.name === 'AbortError') {
      console.error('[RAG Search] Request timed out')
    }
    
    return null
  }
}

export async function POST(request) {
  try {
    const { message, projectContext, projectId } = await request.json()

    console.log("[AI Chat] Request received:", { 
      message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
      projectContext: projectContext?.substring(0, 100) + (projectContext?.length > 100 ? '...' : ''),
      projectId 
    })

    // Validate projectId is provided
    if (!projectId) {
      return NextResponse.json({
        message: "Project ID is required for task operations.",
        tasks: [],
        error: "missing_project_id"
      }, { status: 400 })
    }

    // Check if user is querying existing tasks
    const isQuerying = isQueryingExistingTasks(message)
    
    if (isQuerying) {
      console.log("[AI Chat] Detected query for existing tasks, performing RAG search...")
      
      try {
        // Perform RAG search with authentication and projectId
        const ragResult = await performRAGSearch(message, request, projectId)
        
        if (!ragResult) {
          return NextResponse.json({
            message: "I couldn't find any tasks matching your query. This could be because:\n• No tasks match your search criteria\n• There was a connection issue\n• The task search service is temporarily unavailable\n\nWould you like to create a new task instead?",
            tasks: [],
            searchAttempted: true
          })
        }

        // Use AI to generate a response based on the retrieved task data
        const ragSystemPrompt = `You are an AI project management assistant. 
          The user asked about existing tasks and I found this relevant task data:
          
          Task Data: ${JSON.stringify(ragResult)}
          
          Current project context: ${projectContext}
          Rules:
          1. Always respond ONLY with valid JSON. 
          2. Do not include commentary, markdown, or extra text outside of the JSON. 
          3. Do not include markdown formatting. 

          Please provide a helpful response about this task information. 
          Always respond ONLY with valid JSON in this format:
          {
            "message": "string - your response about the task(s)",
            "tasks": [task objects if you want to display them, otherwise empty array],
            "foundTask": true
          }
          `

        const ragResponse = await ai.models.generateContent({
          model: "models/gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: `${ragSystemPrompt}\n\nUser query: ${message}` }],
            },
          ],
        })

        const ragContent = ragResponse.text
        console.log("[AI Chat] RAG-based response generated successfully")

        const ragJsonResponse = safeJsonParse(ragContent || "{}")
        
        // Include the original task data for frontend use if needed
        ragJsonResponse.retrievedTask = ragResult
        ragJsonResponse.searchSuccessful = true
        
        return NextResponse.json(ragJsonResponse)
        
      } catch (error) {
        if (error.message === 'Authentication required') {
          return NextResponse.json({
            message: "Authentication required to search tasks. Please make sure you're logged in.",
            tasks: [],
            error: "unauthorized"
          }, { status: 401 })
        }
        
        // For other errors, fall back to task creation mode
        console.warn("[AI Chat] RAG search failed, falling back to task creation:", error.message)
        
        // Provide more specific error message to user
        return NextResponse.json({
          message: "I'm having trouble searching for existing tasks right now. This might be due to a temporary connection issue. Would you like to create a new task instead?",
          tasks: [],
          error: "search_failed",
          fallbackToCreation: true
        })
      }
    }

    // Original task creation logic
    const systemPrompt = `You are an AI project management assistant. 
        Help users create and manage tasks for their projects. 
        DONT ADD MARKDOWN FORMATTED JSON

        Current project context: ${projectContext}

        Rules:
        1. Always respond ONLY with valid JSON. 
        2. Do not include commentary, markdown, or extra text outside of the JSON. 
        3. Do not include markdown formatting. 

        The user is requesting to create new tasks. Respond with:
        {
          "tasks": [
            {
              "category": "string",
              "title": "string", 
              "description": "string",
              "priority": "low" | "medium" | "high",
              "taskStatus": "string",
              "assignee": "string",
              "status": "todo"
            }
          ],
          "message": "string"
        }`

    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }],
        },
      ],
    })

    const content = response.text
    console.log("[AI Chat] Task creation response generated successfully")

    const jsonResponse = safeJsonParse(content || "{}")
    jsonResponse.taskCreation = true

    return NextResponse.json(jsonResponse)

  } catch (error) {
    console.error("[AI Chat] API Error:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    })
    
    return NextResponse.json(
      {
        message: "I'm having trouble processing your request right now. Please try again in a moment.",
        tasks: [],
        error: process.env.NODE_ENV === "development" ? error.message : "internal_server_error",
      },
      { status: 500 },
    )
  }
}