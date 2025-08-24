//api/ai-chat/route.js

import { NextResponse } from "next/server"

// Initialize OpenAI client with AIMLAPI
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your environment variables
});

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
    'show', 'find', 'search', 'get',
    'status of', 'progress', 'update on', 'assigned to', 'who is',
    'how many', 'list', 'display', 'tell me about', 'info about',"show","taskStatus"
  ]
  
  const messageLower = message.toLowerCase()
  return queryKeywords.some(keyword => {if(messageLower.includes(keyword)){console.log(keyword)
     return keyword}})
}

// --- helper to perform RAG search with authentication ---
async function performRAGSearch(query, request, projectId) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL
    
    // Forward cookies from the original request
    const cookies = request.headers.get('cookie')

    console.log(baseUrl)

    console.log(`${baseUrl}/api/tasks/search/${projectId}?query=${encodeURIComponent(query)}`)
    
    // Use the projectId in the URL path
    const response = await fetch(`${baseUrl}/api/tasks/search/${projectId}?query=${encodeURIComponent(query)}`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      },
    })

    console.log(response)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // No matching tasks found
      }
      if (response.status === 401) {
        throw new Error('Authentication required')
      }
      throw new Error(`RAG search failed: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('[RAG Search Error]:', error)
    
    // Re-throw authentication errors so they can be handled properly
    if (error.message === 'Authentication required') {
      throw error
    }
    
    return null
  }
}

export async function POST(request) {
  try {
    const { message, projectContext, projectId } = await request.json()

    console.log("[v0] AI Chat request received:", { message, projectContext, projectId })

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
      console.log("[v0] Detected query for existing tasks, performing RAG search...")
      
      try {
        // Perform RAG search with authentication and projectId
        const ragResult = await performRAGSearch(message, request, projectId)
        

        console.log(ragResult)
        if (!ragResult) {
          return NextResponse.json({
            message: "I couldn't find any tasks matching your query. Would you like to create a new task instead?",
            tasks: []
          })
        }

        // Use OpenAI to generate a response based on the retrieved task data
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

        const ragResponse = await openai.chat.completions.create({
          model: 'openai/gpt-5-chat-latest',
          messages: [
            {
              role: 'system',
              content: ragSystemPrompt
            },
            {
              role: 'user',
              content: `User query: ${message}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })

        const ragContent = ragResponse.choices[0].message.content
        console.log("[v0] RAG-based OpenAI response:", ragContent)

        const ragJsonResponse = safeJsonParse(ragContent || "{}")
        
        // Include the original task data for frontend use if needed
        ragJsonResponse.retrievedTask = ragResult
        
        return NextResponse.json(ragJsonResponse)
        
      } catch (error) {
        if (error.message === 'Authentication required') {
          return NextResponse.json({
            message: "Authentication required to search tasks.",
            tasks: [],
            error: "unauthorized"
          }, { status: 401 })
        }
        
        // For other errors, fall back to task creation mode
        console.warn("[v0] RAG search failed, falling back to task creation:", error.message)
      }
    }

    // Original task creation logic with OpenAI
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

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })


    console.log(response.choices[0].message)
    const content = response.choices[0].message.content
    console.log("[v0] OpenAI response:", content)

    const jsonResponse = safeJsonParse(content || "{}")

    console.log(jsonResponse)
    return NextResponse.json(jsonResponse)

  } catch (error) {
    console.error("[v0] AI Chat API Error:", error)
    return NextResponse.json(
      {
        message: "I'm having trouble connecting right now. Please try again later.",
        tasks: [],
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}