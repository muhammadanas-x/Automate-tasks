"use client"

import { Button } from "@/components/ui/button"
import { Plus, Home, BarChart3, Settings, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProject } from "@/contexts/project-context"

export function ProjectSidebar({ currentProjectId }) {
  const { projects, createProject, deleteProject } = useProject()
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    createProject({
      name: newProjectName,
      type: newProjectName.substring(0, 3).toUpperCase(),
      description: newProjectDescription || "New project description",
    })

    setNewProjectName("")
    setNewProjectDescription("")
    setIsNewProjectOpen(false)
  }

  const handleDeleteProject = (projectId) => {
    deleteProject(projectId)
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Pilot
        </span>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROJECTS</h3>
          <span className="text-xs text-gray-400">{projects.length}</span>
        </div>
        <div className="space-y-1">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
              <Link href={`/create/${project.id}`}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-300 hover:shadow-md ${
                    currentProjectId === project.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-sm"
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm">
                    {project.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.taskCount} tasks</div>
                  </div>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 hover:bg-white/80"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 rounded-xl p-3 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-sm bg-white/95 border-white/20">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Project
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-gray-700">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description" className="text-gray-700">
                    Description (Optional)
                  </Label>
                  <Input
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description..."
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewProjectOpen(false)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-auto space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 transition-all duration-300"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 transition-all duration-300"
        >
          <BarChart3 className="w-4 h-4" />
          Boards
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 transition-all duration-300"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
