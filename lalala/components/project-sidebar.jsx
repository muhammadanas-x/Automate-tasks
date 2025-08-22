"use client"

import { Button } from "@/components/ui/button"
import { Plus, Home, BarChart3, Settings, MoreHorizontal, LogOut, Users, Mail, UserPlus } from "lucide-react"
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
  const currentProject = projects?.find(p => p._id === currentProjectId)

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
      console.error('Error creating project:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await deleteProject(projectId)
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !currentProjectId) return

    setIsAddingMember(true)
    setAddMemberError("")

    try {
      const response = await fetch(`/api/projects/${currentProjectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: memberEmail.toLowerCase().trim(),
          role: memberRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member')
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
      <div className="flex  flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
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
                <div className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            TrelloAI
          </span>
        </div>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </div>
            <div className="px-2 py-1.5 text-xs text-gray-500 border-b border-gray-100">
              {user?.email}
            </div>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">PROJECTS</h3>
          <span className="text-xs text-gray-400">{projects?.length || 0}</span>
        </div>
        <div className="space-y-1">
          {projects?.map((project) => (
            <div key={project._id} className="group relative">
              <Link href={`/projects/${project._id}`}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-300 hover:shadow-md ${
                    currentProjectId === project._id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-sm"
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm">
                    {project.name.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-gray-900">{project.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{project.taskCount || 0} tasks</span>
                      {project.members && project.members.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
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
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 hover:bg-white/80"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
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
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm mb-2">No projects yet</div>
              <div className="text-xs">Create your first project to get started</div>
            </div>
          )}

          {/* New Project Dialog */}
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
                    className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isCreating}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewProjectOpen(false)}
                    className="border-gray-200 hover:bg-gray-50"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || isCreating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
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
        
        {/* Add People Dialog */}
        <Dialog open={isAddPeopleOpen} onOpenChange={setIsAddPeopleOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 transition-all duration-300"
              disabled={!currentProjectId}
            >
              <UserPlus className="w-4 h-4" />
              Add People
            </Button>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-sm bg-white/95 border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Add People to Project
              </DialogTitle>
              {currentProject && (
                <p className="text-sm text-gray-600">
                  Adding to: <span className="font-medium">{currentProject.name}</span>
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
                  className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isAddingMember}
                />
              </div>

              <div>
                <Label htmlFor="member-role" className="text-gray-700">
                  Role
                </Label>
                <Select value={memberRole} onValueChange={setMemberRole} disabled={isAddingMember}>
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user?.name || member.email}
                          </p>
                          {member.user?.name && (
                            <p className="text-xs text-gray-600">{member.email}</p>
                          )}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            member.role === 'owner' 
                              ? 'bg-purple-100 text-purple-800'
                              : member.role === 'editor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
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
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
                  className="border-gray-200 hover:bg-gray-50"
                  disabled={isAddingMember}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!memberEmail.trim() || isAddingMember}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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