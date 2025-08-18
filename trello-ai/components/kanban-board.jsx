"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Plus, MoreHorizontal, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useProject } from "@/contexts/project-context"

const getProjectTitle = (projectId) => {
  switch (projectId) {
    case "space-shooter":
      return "Space Shooter Game"
    case "ai-app":
      return "AI Project Management App"
    case "dinner-plan":
      return "Dinner Plan with Friends"
    default:
      return "New Project"
  }
}

const getProjectDescription = (projectId) => {
  switch (projectId) {
    case "space-shooter":
      return "Develop a classic 2D top-down space shooter game."
    case "ai-app":
      return "Build an AI-powered project management application."
    case "dinner-plan":
      return "Plan and organize dinner events with friends."
    default:
      return "Create a new project to get started."
  }
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
    case "medium":
      return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200"
    case "low":
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
    default:
      return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
  }
}

export function KanbanBoard({ projectId }) {
  const { getProjectTasks, createTask, updateTask, deleteTask, setCurrentProject } = useProject()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [newTaskColumn, setNewTaskColumn] = useState("todo")
  const [selectedTask, setSelectedTask] = useState(null)

  const handleCardClick = (task) => {
    setSelectedTask(task)
  }

  const handleSave = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, selectedTask)
      setSelectedTask(null)
    }
  }

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "medium",
  })

  const tasks = getProjectTasks(projectId)

  useEffect(() => {
    setCurrentProject(projectId)
  }, [projectId, setCurrentProject])

  const projectTitle = getProjectTitle(projectId)
  const projectDescription = getProjectDescription(projectId)

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tasksByStatus = {
    todo: filteredTasks.filter((task) => task.status === "todo"),
    inProgress: filteredTasks.filter((task) => task.status === "inProgress"),
    done: filteredTasks.filter((task) => task.status === "done"),
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return

    createTask({
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee || "Unassigned",
      status: newTaskColumn,
      priority: newTask.priority,
      projectId: projectId,
    })

    setNewTask({ title: "", description: "", assignee: "", priority: "medium" })
    setIsNewTaskOpen(false)
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus })
  }

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/20 p-6 backdrop-blur-sm bg-white/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {projectTitle}
            </h1>
            <p className="text-gray-600">{projectDescription}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 w-64 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-white/80">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-3 gap-6 h-full">
          
          {/* To Do Column */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">To Do</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                >
                  {tasksByStatus.todo.length}
                </Badge>
                <Dialog
                  open={isNewTaskOpen && newTaskColumn === "todo"}
                  onOpenChange={(open) => {
                    setIsNewTaskOpen(open)
                    if (open) setNewTaskColumn("todo")
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* 👇 Scrollable list */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {tasksByStatus.todo.map((task) => (
                <Card
                  onClick={() => handleCardClick(task)}
                  key={task.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
                >
                   

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 mb-1">{task.id}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:bg-white/80"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "inProgress")}>
                            Move to In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "done")}>
                            Move to Done
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-900">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{task.assignee}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} shadow-sm`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">In Progress</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border-orange-200"
                >
                  {tasksByStatus.inProgress.length}
                </Badge>
                <Dialog
                  open={isNewTaskOpen && newTaskColumn === "inProgress"}
                  onOpenChange={(open) => {
                    setIsNewTaskOpen(open)
                    if (open) setNewTaskColumn("inProgress")
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* 👇 Scrollable list */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {tasksByStatus.inProgress.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group backdrop-blur-sm bg-white/80 border-white/20 hover:bg-white/90"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 mb-1">{task.id}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:bg-white/80"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "todo")}>
                            Move to To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "done")}>
                            Move to Done
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-900">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{task.assignee}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} shadow-sm`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Done</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                >
                  {tasksByStatus.done.length}
                </Badge>
                <Dialog
                  open={isNewTaskOpen && newTaskColumn === "done"}
                  onOpenChange={(open) => {
                    setIsNewTaskOpen(open)
                    if (open) setNewTaskColumn("done")
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* 👇 Scrollable list */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {tasksByStatus.done.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group opacity-75 backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 mb-1">{task.id}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:bg-white/80"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-white/95 border-white/20">
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "todo")}>
                            Move to To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, "inProgress")}>
                            Move to In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-sm font-semibold line-through text-gray-700">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-500 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{task.assignee}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} shadow-sm`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="backdrop-blur-sm bg-white/95 border-white/20">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Create New Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title" className="text-gray-700">
                Task Title
              </Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <Label htmlFor="task-description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description..."
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <Label htmlFor="task-assignee" className="text-gray-700">
                Assignee
              </Label>
              <Input
                id="task-assignee"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Enter assignee name..."
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <Label htmlFor="task-priority" className="text-gray-700">
                Priority
              </Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm bg-white/95 border-white/20">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNewTaskOpen(false)}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


       <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        {selectedTask && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={selectedTask.title}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={selectedTask.description}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, description: e.target.value })
                }
              />
            </div>

            {/* Assignee */}
            <div>
              <Label className="text-sm font-medium">Assignee</Label>
              <Input
                value={selectedTask.assignee}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, assignee: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Task Status (Please update on this field) </Label>
              <Textarea
                value={"Update on this field"}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, taskStatus: e.target.value })
                }
              />
            </div>


            {/* Priority */}
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={selectedTask.priority}
                onValueChange={(val) =>
                  setSelectedTask({ ...selectedTask, priority: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setSelectedTask(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSave()
              setSelectedTask(null)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    </div>
  )
}
