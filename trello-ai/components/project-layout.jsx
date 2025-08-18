import { ProjectSidebar } from "./project-sidebar"
import { KanbanBoard } from "./kanban-board"
import { AiChatSidebar } from "./ai-chat-sidebar"
import { ProjectProvider } from "@/contexts/project-context"

export function ProjectLayout({ projectId }) {
  return (
    <ProjectProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-300/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Left Sidebar - Projects */}
        <div className="relative z-10 w-60 backdrop-blur-sm bg-white/80 border-r border-white/20 shadow-lg">
          <ProjectSidebar currentProjectId={projectId} />
        </div>

        {/* Main Content - Kanban Board */}
        <div className="relative z-10 flex-1 flex flex-col">
          <KanbanBoard projectId={projectId} />
        </div>

        {/* Right Sidebar - AI Chat */}
        <div className="relative z-10 w-80 backdrop-blur-sm bg-white/80 border-l border-white/20 shadow-lg">
          <AiChatSidebar projectId={projectId} />
        </div>
      </div>
    </ProjectProvider>
  )
}
