"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ProjectContext = createContext(undefined)

const initialProjects = [
  {
    id: "dinner-plan",
    name: "Dinner Plan with Friends",
    type: "DINNER",
    description: "Plan and organize dinner events with friends",
    createdAt: "2024-01-15",
    taskCount: 3,
  },
  {
    id: "ai-app",
    name: "AI Project Management App",
    type: "AIAPP",
    description: "Build an AI-powered project management application",
    createdAt: "2024-01-10",
    taskCount: 4,
  },
  {
    id: "space-shooter",
    name: "Space Shooter Game",
    type: "SSG",
    description: "Develop a classic 2D top-down space shooter game",
    createdAt: "2024-01-08",
    taskCount: 5,
  },
]

const initialTasks = [
  {
    id: "SSG-T-002",
    title: "Player Ship Core Mechanics",
    description: "Implement basic player ship controls, movement, and collision detection.",
    assignee: "Programmer",
    status: "todo",
    priority: "high",
    createdAt: "2024-01-15",
    projectId: "space-shooter",
  },
  {
    id: "SSG-T-004",
    title: "Placeholder Asset Creation",
    description: "Create placeholder sprites for the player ship, enemies, projectiles, and background elements.",
    assignee: "Artist",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-14",
    projectId: "space-shooter",
  },
  {
    id: "SSG-T-005",
    title: "Basic UI and Scoring System",
    description: "Implement a basic score display, health bar, and game over screen.",
    assignee: "Programmer",
    status: "todo",
    priority: "low",
    createdAt: "2024-01-13",
    projectId: "space-shooter",
  },
  {
    id: "SSG-T-001",
    title: "Game Design Document",
    description: "Outline core mechanics, story, levels, and art style for the game.",
    assignee: "Game Designer",
    status: "inProgress",
    priority: "high",
    createdAt: "2024-01-12",
    projectId: "space-shooter",
  },
  {
    id: "SSG-T-003",
    title: "Enemy AI and Spawning",
    description: "Develop basic enemy AI behaviors, projectile firing, and wave spawning logic.",
    assignee: "Programmer",
    status: "done",
    priority: "medium",
    createdAt: "2024-01-10",
    projectId: "space-shooter",
  },
  {
    id: "AI-T-001",
    title: "Setup Authentication System",
    description: "Implement user registration, login, and session management.",
    assignee: "Backend Developer",
    status: "todo",
    priority: "high",
    createdAt: "2024-01-14",
    projectId: "ai-app",
  },
  {
    id: "AI-T-002",
    title: "Design Database Schema",
    description: "Create database tables for users, projects, and tasks.",
    assignee: "Database Admin",
    status: "inProgress",
    priority: "high",
    createdAt: "2024-01-13",
    projectId: "ai-app",
  },
  {
    id: "AI-T-003",
    title: "Build Project Dashboard",
    description: "Create the main dashboard interface for project management.",
    assignee: "Frontend Developer",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-12",
    projectId: "ai-app",
  },
  {
    id: "AI-T-004",
    title: "Integrate AI API",
    description: "Connect with AI service for task generation and assistance.",
    assignee: "Full Stack Developer",
    status: "todo",
    priority: "low",
    createdAt: "2024-01-11",
    projectId: "ai-app",
  },
  {
    id: "DN-T-001",
    title: "Create Guest List",
    description: "Compile and manage the list of dinner party guests.",
    assignee: "Event Planner",
    status: "done",
    priority: "high",
    createdAt: "2024-01-16",
    projectId: "dinner-plan",
  },
  {
    id: "DN-T-002",
    title: "Plan Menu",
    description: "Design the dinner menu considering dietary restrictions.",
    assignee: "Chef",
    status: "inProgress",
    priority: "high",
    createdAt: "2024-01-15",
    projectId: "dinner-plan",
  },
  {
    id: "DN-T-003",
    title: "Send Invitations",
    description: "Send out dinner party invitations to all guests.",
    assignee: "Event Planner",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-14",
    projectId: "dinner-plan",
  },
]

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [currentProject, setCurrentProjectState] = useState(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("pilot-projects")
    const savedTasks = localStorage.getItem("pilot-tasks")

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    } else {
      setProjects(initialProjects)
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      setTasks(initialTasks)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("pilot-projects", JSON.stringify(projects))
    }
  }, [projects])

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("pilot-tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  const createProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: projectData.name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date().toISOString().split("T")[0],
      taskCount: 0,
    }
    setProjects((prev) => [...prev, newProject])
  }

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId))
  }

  
  const createTask = (taskData) => {
    const projectTasks = tasks.filter((t) => t.projectId === taskData.projectId)
    let taskNumber = projectTasks.length + 1
    const projectPrefix = taskData.projectId.toUpperCase().substring(0, 3)


    const newTask = {
    ...taskData,
    id: `${projectPrefix}-T-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, 
    createdAt: new Date().toISOString().split("T")[0],
    }



    setTasks((prev) => [...prev, newTask])

    setProjects((prev) => prev.map((p) => (p.id === taskData.projectId ? { ...p, taskCount: p.taskCount + 1 } : p)))
  }

  const updateTask = (taskId, updates) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const deleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      setProjects((prev) =>
        prev.map((p) => (p.id === task.projectId ? { ...p, taskCount: Math.max(0, p.taskCount - 1) } : p)),
      )
    }
  }

  const setCurrentProject = (projectId) => {
    const project = projects.find((p) => p.id === projectId)
    setCurrentProjectState(project || null)
  }

  const getProjectTasks = (projectId) => {
    return tasks.filter((task) => task.projectId === projectId)
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        tasks,
        currentProject,
        createProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        setCurrentProject,
        getProjectTasks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
