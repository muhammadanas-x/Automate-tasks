import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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", // ⚡ don't hardcode secrets
})

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

export async function POST(request) {
  try {
    const { message, projectContext } = await request.json()

    console.log("[v0] AI Chat request received:", { message, projectContext })

    const systemPrompt = `You are an AI project management assistant. 
            Help users create and manage tasks for their projects. 

            Current project context: ${projectContext}

            Always respond ONLY with valid JSON. 
            Do not include commentary, markdown, or extra text outside of the JSON.

            When creating tasks, respond with:
            {
            "tasks": [
                {
                "category" : "string",
                "title": "string",
                "description": "string",
                "priority": "low" | "medium" | "high",
                "taskStatus" : "string",
                "assignee": "string",
                "status": "todo"
                }
            ],
            "message": "string"
            }

            If the user is only asking a question or having a conversation, respond with:
            {
            "message": "Your response here",
            "tasks": []
            }`

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // 👈 force JSON
    })

    const response = completion.choices[0].message.content
    console.log("[v0] OpenAI response:", response)

    const jsonResponse = safeJsonParse(response || "{}")
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
