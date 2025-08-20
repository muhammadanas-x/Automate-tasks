'use client'


import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [currentProject, setCurrentProjectState] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load data from API when user is authenticated
  useEffect(() => {
    if (user) {
      loadProjects()
      loadTasks()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/taskSave')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const createProject = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        const data = await response.json()
        setProjects((prev) => [...prev, data.project])
        return data.project
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId))
        setTasks((prev) => prev.filter((t) => t.projectId !== projectId))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const createTask = async (taskData) => {

    try {
      const response = await fetch('/api/taskSave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks((prev) => [...prev, data.task])
        // Update project task count locally
        setProjects((prev) =>
          prev.map((p) =>
            p._id === taskData.projectId
              ? { ...p, taskCount: p.taskCount + 1 }
              : p
          )
        )
        return data.task
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/taskSave/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? data.task : task))
        )
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/taskSave/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const task = tasks.find((t) => t._id === taskId)
        if (task) {
          setTasks((prev) => prev.filter((t) => t._id !== taskId))
          setProjects((prev) =>
            prev.map((p) =>
              p._id === task.projectId
                ? { ...p, taskCount: Math.max(0, p.taskCount - 1) }
                : p
            )
          )
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const setCurrentProject = (projectId) => {
    const project = projects.find((p) => p._id === projectId)
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
        loading,
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
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}