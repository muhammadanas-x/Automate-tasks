"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useProject } from "@/contexts/project-context"

// Mock quick prompts based on project type
const getQuickPrompts = (projectId) => {
  switch (projectId) {
    case "space-shooter":
      return [
        "Add task: 'Review Q4 budget proposals' with high priority due tomorrow",
        "Plan a marketing campaign for our new feature launch in Q3",
        "Break down 'Build login page' into smaller tasks.",
      ]
    case "ai-app":
      return [
        "Create user authentication system tasks",
        "Plan database schema for project management",
        "Add tasks for AI integration and API setup",
      ]
    default:
      return [
        "Create initial project setup tasks",
        "Plan project milestones and deadlines",
        "Break down main features into actionable tasks",
      ]
  }
}

const getProjectContext = (projectId, tasks, getProjectTasks) => {
  // Option 1: all tasks of this project
  const projectTasks = getProjectTasks(projectId)

  // Option 2: filter tasks manually
  // const projectTasks = tasks.filter((t) => t.projectId === projectId)

  return {
    projectId,
    tasks: projectTasks,
  }
}



export function AiChatSidebar({ projectId }) {
  const { createTask, currentProject, tasks, getProjectTasks } = useProject()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)

  const quickPrompts = getQuickPrompts(projectId)
  const projectContext = getProjectContext(projectId, tasks, getProjectTasks)


  console.log(projectContext.tasks)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (content) => {
    if (!content.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    console.log(currentProject)
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          projectContext: `${currentProject?.name || "New Project"}: Already Implemented ${projectContext.tasks} `,
          projectId: currentProject._id
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API response is not JSON")
      }

      const data = await response.json()
      console.log(data)

      // Add any tasks returned by AI
      if (data.tasks && data.tasks.length > 0) {
            console.log('AI returned tasks:', data.tasks);

            if(!data.foundTask)
            {
                // Send the whole array to our /api/tasks endpoint
              try {
                  await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data.tasks),   // expects [{...}, {...}]
                  });
              } catch (storeErr) {
                  console.error('Failed to store AI tasks:', storeErr);
              }

              // …then create them in local state (or skip if you prefer to re-read from DB)
              data.tasks.forEach(task =>
                  createTask({ ...task, projectId })
              );
                const aiMessage = {
                  id: (Date.now() + 1).toString(),
                  content: data.message || "I'm here to help with your project management needs!",
                  sender: "ai",
                  timestamp: new Date(), 

                }

                setMessages((prev) => [...prev, aiMessage])


            }

            if(data.foundTask)
            {
               const aiMessage = {
                  id: (Date.now() + 1).toString(),
                  content: data.message || "I'm here to help with your project management needs!",
                  sender: "ai",
                  timestamp: new Date(),
                  tasks: data.tasks   // <- include the raw array

                }


               setMessages((prev) => [...prev, aiMessage])

            }
          
      }




    } catch (error) {
      console.error("AI Chat Error:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          AI Project Pilot
        </h2>
        <Sparkles className="w-4 h-4 text-blue-600 ml-auto" />
      </div>

      <Card className="mb-6 backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            Project:{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentProject?.name || "New Project"}
            </span>
          </p>
        <p className="text-xs text-gray-500 mt-2">{projectContext.projectId}</p>
        </CardContent>
      </Card>

      {messages.length === 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">QUICK PROMPTS</h3>
          <div className="space-y-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left text-xs p-3 h-auto whitespace-normal justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-900"
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 mb-4">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                Start a conversation with AI to create tasks for your project
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl p-3 text-sm shadow-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "backdrop-blur-sm bg-white/80 text-gray-700 border border-white/20"
                    }`}
                  >
                    <p>{message.content}</p>


                     {/* task list (only if AI and tasks exist) */}
                      {message.sender === "ai" && message.tasks?.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                          {message.tasks.map((task) => (
                            <li key={task.id}>{task.title} </li>
                          ))}
                        </ul>
      )}
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="backdrop-blur-sm bg-white/80 rounded-xl p-3 text-sm border border-white/20">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="e.g., Plan our product launch..."
          className="flex-1 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
        />
        <Button
          size="icon"
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isTyping}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
