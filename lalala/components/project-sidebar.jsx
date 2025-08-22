"use client"

import { Button } from "@/components/ui/button"
import { Plus, Home, Settings, MoreHorizontal, LogOut, Users, Mail, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/hooks/useAuth"

export function ProjectSidebar({ currentProjectId }) {
  const { projects, createProject, deleteProject, loading } = useProject()
  const { user, logout } = useAuth()

  // New project state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Add people state
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState("editor")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState("")

  // Get current project for adding members
  const currentProject = projects?.find((p) => p._id === currentProjectId)

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || "New project description",
      })

      setNewProjectName("")
      setNewProjectDescription("")
      setIsNewProjectOpen(false)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project? This will also delete all associated tasks.")) {
      try {
        await deleteProject(projectId)
      } catch (error) {
        console.error("Error deleting project:", error)
      }
    }
  }

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !currentProjectId) return

    setIsAddingMember(true)
    setAddMemberError("")

    try {
      const response = await fetch(`/api/projects/${currentProjectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: memberEmail.toLowerCase().trim(),
          role: memberRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add member")
      }

      // Reset form
      setMemberEmail("")
      setMemberRole("editor")
      setIsAddPeopleOpen(false)

      // You might want to refresh the project data here
      // or update the project context with the new member
    } catch (error) {
      setAddMemberError(error.message)
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50/30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-violet-900 to-purple-600 bg-clip-text text-transparent">
              TrelloAI
            </span>
          </div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROJECTS</h3>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm bg-white/40 border border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-200 to-purple-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-violet-200 to-purple-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gradient-to-r from-violet-100 to-purple-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50/30">
        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-pink-400/25 to-orange-500/25 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-xl animate-float-reverse"></div>

        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-violet-400/40 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce-slow delay-300"></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce-slow delay-700"></div>
      </div>

      <div className="relative z-10 animate-fade-in-up">
        {/* Header with user info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-violet-900 to-purple-600 bg-clip-text text-transparent">
              TrelloAI
            </span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/90 border-white/30 shadow-xl">
              <div className="px-2 py-1.5 text-sm font-medium bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                {user?.name || "User"}
              </div>
              <div className="px-2 py-1.5 text-xs text-gray-500 border-b border-gray-100">{user?.email}</div>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Projects Section */}
        <div className="mb-8 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROJECTS</h3>
            <span className="text-xs text-gray-400 bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm">
              {projects?.length || 0}
            </span>
          </div>
          <div className="space-y-1">
            {projects?.map((project, index) => (
              <div
                key={project._id}
                className="group relative animate-fade-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/projects/${project._id}`}>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm ${
                      currentProjectId === project._id
                        ? "bg-gradient-to-r from-violet-100/80 to-purple-100/80 border border-violet-200/50 shadow-md"
                        : "hover:bg-gradient-to-r hover:from-white/60 hover:to-violet-50/60 bg-white/30 border border-white/20"
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-200 to-purple-200 text-violet-700 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300">
                      {project.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {project.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-violet-100/50 px-2 py-0.5 rounded-full">
                          {project.taskCount || 0} tasks
                        </span>
                        {project.members && project.members.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1 bg-purple-100/50 px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3" />
                              <span>{project.members.length}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-6 h-6 hover:bg-white/80 backdrop-blur-sm"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/90 border-white/30 shadow-xl">
                    <DropdownMenuItem className="hover:bg-violet-50">Edit Project</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-violet-50">Duplicate</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteProject(project._id)}
                    >
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Empty state */}
            {projects?.length === 0 && (
              <div className="text-center py-8 text-gray-500 backdrop-blur-sm bg-white/20 rounded-xl border border-white/30 animate-fade-in">
                <div className="text-sm mb-2 bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                  No projects yet
                </div>
                <div className="text-xs">Create your first project to get started</div>
              </div>
            )}

            {/* New Project Dialog */}
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-gradient-to-r hover:from-violet-50/80 hover:to-purple-50/80 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm bg-white/30 border border-white/20 hover:shadow-md hover:scale-[1.02] animate-fade-in-up delay-200"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-md bg-white/95 border-white/30 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-violet-900 to-purple-600 bg-clip-text text-transparent">
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
                      className="bg-white/70 border-violet-200 focus:border-violet-500 focus:ring-violet-500/20 backdrop-blur-sm"
                      disabled={isCreating}
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
                      className="bg-white/70 border-violet-200 focus:border-violet-500 focus:ring-violet-500/20 backdrop-blur-sm"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewProjectOpen(false)}
                      className="border-gray-200 hover:bg-gray-50 backdrop-blur-sm"
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim() || isCreating}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isCreating ? "Creating..." : "Create Project"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-auto space-y-1 animate-fade-in-up delay-300">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-violet-50/80 hover:to-purple-50/80 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm bg-white/30 border border-white/20 hover:shadow-md hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>

          {/* Add People Dialog */}
          <Dialog open={isAddPeopleOpen} onOpenChange={setIsAddPeopleOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-violet-50/80 hover:to-purple-50/80 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm bg-white/30 border border-white/20 hover:shadow-md hover:scale-[1.02] disabled:opacity-50"
                disabled={!currentProjectId}
              >
                <UserPlus className="w-4 h-4" />
                Add People
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-md bg-white/95 border-white/30 shadow-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-violet-900 to-purple-600 bg-clip-text text-transparent">
                  <UserPlus className="w-5 h-5 text-violet-600" />
                  Add People to Project
                </DialogTitle>
                {currentProject && (
                  <p className="text-sm text-gray-600">
                    Adding to:{" "}
                    <span className="font-medium bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {currentProject.name}
                    </span>
                  </p>
                )}
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="member-email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="bg-white/70 border-violet-200 focus:border-violet-500 focus:ring-violet-500/20 backdrop-blur-sm"
                    disabled={isAddingMember}
                  />
                </div>

                <div>
                  <Label htmlFor="member-role" className="text-gray-700">
                    Role
                  </Label>
                  <Select value={memberRole} onValueChange={setMemberRole} disabled={isAddingMember}>
                    <SelectTrigger className="bg-white/70 border-violet-200 focus:border-violet-500 focus:ring-violet-500/20 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-white/95 border-white/30">
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Viewer
                          </Badge>
                          <span className="text-sm">Can view project and tasks</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Editor
                          </Badge>
                          <span className="text-sm">Can edit tasks and project</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="owner">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                            Owner
                          </Badge>
                          <span className="text-sm">Full access including member management</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Members */}
                {currentProject?.members && currentProject.members.length > 0 && (
                  <div>
                    <Label className="text-gray-700 text-sm">Current Members ({currentProject.members.length})</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {currentProject.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-2 rounded-lg text-sm border border-white/30"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{member.user?.name || member.email}</p>
                            {member.user?.name && <p className="text-xs text-gray-600">{member.email}</p>}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              member.role === "owner"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "editor"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {addMemberError && (
                  <div className="text-red-600 text-sm bg-red-50/80 backdrop-blur-sm p-3 rounded-lg border border-red-200">
                    {addMemberError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddPeopleOpen(false)
                      setMemberEmail("")
                      setMemberRole("editor")
                      setAddMemberError("")
                    }}
                    className="border-gray-200 hover:bg-gray-50 backdrop-blur-sm"
                    disabled={isAddingMember}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!memberEmail.trim() || isAddingMember}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isAddingMember ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-violet-50/80 hover:to-purple-50/80 rounded-xl p-3 transition-all duration-300 backdrop-blur-sm bg-white/30 border border-white/20 hover:shadow-md hover:scale-[1.02]"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(-10px) rotate(0deg); }
          50% { transform: translateY(0px) rotate(-90deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  )
}
