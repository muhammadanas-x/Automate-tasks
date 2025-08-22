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
          projectId: currentProject._id,
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
        console.log("AI returned tasks:", data.tasks)

        if (!data.foundTask) {
          // Send the whole array to our /api/tasks endpoint
          try {
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data.tasks), // expects [{...}, {...}]
            })
          } catch (storeErr) {
            console.error("Failed to store AI tasks:", storeErr)
          }

          // …then create them in local state (or skip if you prefer to re-read from DB)
          data.tasks.forEach((task) => createTask({ ...task, projectId }))
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.message || "I'm here to help with your project management needs!",
            sender: "ai",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, aiMessage])
        }

        if (data.foundTask) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.message || "I'm here to help with your project management needs!",
            sender: "ai",
            timestamp: new Date(),
            tasks: data.tasks, // <- include the raw array
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
    <div className="flex flex-col h-full max-h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50/20">
        {/* Floating gradient orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-violet-400/20 via-purple-400/15 to-pink-400/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-blue-400/15 via-indigo-400/10 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-300/10 via-rose-300/15 to-orange-300/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Floating particles */}
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-violet-400/40 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-40 right-16 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-bounce"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="absolute bottom-32 left-8 w-2.5 h-2.5 bg-pink-400/30 rounded-full animate-bounce"
          style={{ animationDelay: "3.5s" }}
        />
        <div
          className="absolute bottom-20 right-12 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-0 relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/25 animate-pulse">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold bg-gradient-to-r from-violet-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
            AI Project Pilot
          </h2>
          <Sparkles className="w-4 h-4 text-violet-600 ml-auto animate-pulse" />
        </div>

        <Card
          className="mb-6 backdrop-blur-xl bg-white/20 border-white/30 shadow-2xl shadow-purple-500/10 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <CardContent className="p-4">
            <p className="text-sm text-gray-700 font-medium">
              Project:{" "}
              <span className="font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                {currentProject?.name || "New Project"}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-2 font-medium">{projectContext.projectId}</p>
          </CardContent>
        </Card>

        {messages.length === 0 && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gradient-to-r from-violet-800 to-purple-800 bg-clip-text text-transparent">
              QUICK PROMPTS
            </h3>
            <div className="space-y-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left text-xs p-3 h-auto whitespace-normal justify-start hover:bg-gradient-to-r hover:from-violet-100/80 hover:via-purple-100/60 hover:to-pink-100/40 rounded-xl transition-all duration-500 text-gray-700 hover:text-gray-900 backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 animate-fade-in-up"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Area - This now has proper flex behavior */}
      <div className="flex-1 min-h-0 px-4 relative z-10">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-8 animate-fade-in">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/25 animate-pulse">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium">Start a conversation with AI to create tasks for your project</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fade-in-up ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.sender === "ai" && (
                    <div className="w-6 h-6 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-500/25">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl p-3 text-sm shadow-xl transition-all duration-300 hover:shadow-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-purple-500/25"
                        : "backdrop-blur-xl bg-white/25 text-gray-800 border border-white/30 shadow-purple-500/10"
                    }`}
                  >
                    <p className="font-medium">{message.content}</p>

                    {/* task list (only if AI and tasks exist) */}
                    {message.sender === "ai" && message.tasks?.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs list-disc list-inside font-medium">
                        {message.tasks.map((task) => (
                          <li key={task.id}>{task.title}</li>
                        ))}
                      </ul>
                    )}
                    <p
                      className={`text-xs mt-1 font-medium ${message.sender === "user" ? "text-purple-100" : "text-gray-600"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-6 h-6 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-500/25">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="backdrop-blur-xl bg-white/25 rounded-xl p-3 text-sm border border-white/30 shadow-xl shadow-purple-500/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 pt-0 relative z-10 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="e.g., Plan our product launch..."
            className="flex-1 backdrop-blur-xl bg-white/20 border-white/30 focus:border-violet-400 focus:ring-violet-400/30 shadow-lg text-gray-800 placeholder:text-gray-600 font-medium"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
