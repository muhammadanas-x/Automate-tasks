
import { NextResponse } from "next/server"
import { OpenAI } from 'openai'

const api = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.AIML_API_KEY,
})

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

        // Simple way to display your ragResult tasks
      if (ragResult && ragResult.tasks) {
        console.log(`Found ${ragResult.count} tasks assigned to alice:`);
        
        ragResult.tasks.forEach((item, index) => {
          const task = item.task; // Extract the actual task object
          console.log(`\n--- Task ${index + 1} ---`);
          console.log(`ID: ${item.id}`);
          console.log(`Score: ${item.score}`);
          console.log(`Task Details:`, task);
          
          // If you want to display specific task properties:
          if (task) {
            console.log(`Title: ${task.title || 'N/A'}`);
            console.log(`Status: ${task.status || 'N/A'}`);
            console.log(`Assigned to: ${task.assignedTo || 'N/A'}`);
            console.log(`Description: ${task.description || 'N/A'}`);
          }
        });
      }

      // Alternative: Create a formatted response without OpenAI
      function createDirectResponse(ragResult) {
        if (!ragResult || !ragResult.tasks || ragResult.tasks.length === 0) {
          return {
            message: "No tasks found assigned to alice.",
            tasks: [],
            foundTask: false
          };
        }

        const formattedTasks = ragResult.tasks.map(item => item.task).filter(task => task);
        
        return {
          message: `Found ${ragResult.count} tasks assigned to alice.`,
          tasks: formattedTasks,
          foundTask: true,
          retrievedTask: ragResult
        };
      }

      // Use this instead of the OpenAI call:
      const directResponse = createDirectResponse(ragResult);
      console.log("Direct response:", directResponse);
      return NextResponse.json(directResponse);
        
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
    const systemPrompt = `You are an AI project management assistant. Help users create and manage tasks for their projects.

Current project context: ${projectContext}

IMPORTANT: Always respond with valid JSON only. No markdown, no extra text.

The user is requesting to create new tasks. Respond with:
{
  "tasks": [
    {
      "category": "string",
      "title": "string", 
      "description": "string",
      "priority": "low",
      "taskStatus": "string",
      "assignee": "string",
      "status": "todo"
    }
  ],
  "message": "string"
}`

    try {
      const response = await api.chat.completions.create({
        model: 'gpt-4o-mini', // Changed to a more reliable model
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
        temperature: 0.3, // Reduced for more consistent responses
        max_tokens: 1000
      })

      // Debug logging
      console.log("[v0] Full OpenAI response:", JSON.stringify(response, null, 2))
      console.log("[v0] Response choices:", response.choices)
      console.log("[v0] First choice:", response.choices[0])
      console.log("[v0] Message content:", response.choices[0]?.message?.content)
      console.log("[v0] Finish reason:", response.choices[0]?.finish_reason)

      const content = response.choices[0]?.message?.content || ""
      console.log("[v0] OpenAI response content:", content)

      if (!content) {
        throw new Error("Empty response from OpenAI")
      }

      const jsonResponse = safeJsonParse(content)
      console.log(jsonResponse)
      return NextResponse.json(jsonResponse)

    } catch (apiError) {
      console.error("[v0] OpenAI API Error:", apiError)
      
      // Fallback response
      return NextResponse.json({
        message: "I'll help you create that task.",
        tasks: [{
          category: "General",
          title: "New Task",
          description: message,
          priority: "medium",
          taskStatus: "pending",
          assignee: "unassigned",
          status: "todo"
        }]
      })
    }

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