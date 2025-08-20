// app/api/tasks/[taskId]/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Project from "@/models/Project"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Pinecone } from '@pinecone-database/pinecone'
import { pipeline } from '@xenova/transformers'

// Pinecone setup
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "pcsk_2ZfMks_9jAq99bkxRTgVFK2SggAsdBQbzM5aNmDgcV9YEMEZAnMDc8Yv9ZkuqDVcyb5iQi",
})

const index = pc.index('task-vector')

// Initialize the embedding model (1024 dimensions)
let embedder = null

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading 1024D embedder...')
    embedder = await pipeline('feature-extraction', 'Xenova/e5-large-v2')
    console.log('1024D Embedder loaded successfully')
  }
  return embedder
}

// Generate embedding for task content
async function generateTaskEmbedding(task) {
  try {
    const model = await getEmbedder()
    
    // Combine relevant task fields for embedding
    const taskText = [
      task.title || '',
      task.description || '',
      task.category || '',
      task.priority || '',
      task.status || '',
      task.assignee || ''
    ].filter(Boolean).join(' ')
    
    if (!taskText.trim()) {
      throw new Error('No text content available for embedding')
    }
    
    const output = await model(taskText, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)
    
    if (embedding.length !== 1024) {
      throw new Error(`Expected 1024 dimensions, got ${embedding.length}`)
    }
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Store/Update task in Pinecone
async function upsertTaskToPinecone(task) {
  try {
    const embedding = await generateTaskEmbedding(task)
    
    const vector = {
      id: task._id.toString(),
      values: embedding,
      metadata: {
        userId: task.userId ? task.userId.toString() : '',
        title: task.title || '',
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || '',
        status: task.status || '',
        taskStatus: task.taskStatus || '',
        assignee: task.assignee ? task.assignee.toString() : '',
        projectId: task.projectId ? task.projectId.toString() : null,
        createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString()
      }
    }
    
    await index.upsert([vector])
    console.log(`Task ${task._id} updated in Pinecone successfully`)
  } catch (error) {
    console.error('Error updating task in Pinecone:', error)
    // Don't throw here to avoid breaking the main operation
  }
}

// Delete task from Pinecone
async function deleteTaskFromPinecone(taskId) {
  try {
    await index.deleteOne(taskId.toString())
    console.log(`Task ${taskId} deleted from Pinecone successfully`)
  } catch (error) {
    console.error('Error deleting task from Pinecone:', error)
    // Don't throw here to avoid breaking the main operation
  }
}

// Helper function to check if user has access to a task
async function checkTaskAccess(taskId, userId, requiredRole = 'viewer') {
  const task = await Task.findById(taskId).populate('assignee', 'name email')
  
  if (!task) {
    return { hasAccess: false, task: null, userRole: null }
  }

  // Check if it's a legacy task (user owns it directly)
  if (task.userId && task.userId.toString() === userId) {
    return { hasAccess: true, task, userRole: 'owner' }
  }

  // Check project-based access
  if (task.projectId) {
    const project = await Project.findOne({
      _id: task.projectId,
      $or: [
        { userId: userId }, // Legacy support
        { 'members.user': userId }, // New structure
      ]
    })

    if (!project) {
      return { hasAccess: false, task, userRole: null }
    }

    // Find user's role in the project
    const member = project.members.find(m => 
      m.user && m.user.toString() === userId
    )
    
    const userRole = member ? member.role : 'owner' // fallback for legacy projects

    // Check if user has required role
    const roleHierarchy = { viewer: 1, editor: 2, owner: 3 }
    const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole]
    
    if (!hasRequiredRole) {
      return { hasAccess: false, task, userRole, insufficientRole: true }
    }

    return { hasAccess: true, task, userRole }
  }

  return { hasAccess: false, task, userRole: null }
}

export async function GET(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const { taskId } = await params

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 })
    }

    const { hasAccess, task } = await checkTaskAccess(taskId, decoded.userId, 'viewer')

    if (!hasAccess) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error("Task GET error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const { taskId } = await params
    const updates = await req.json()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 })
    }

    // Check if user has editor access to the task
    const { hasAccess, task, insufficientRole } = await checkTaskAccess(
      taskId, 
      decoded.userId, 
      'editor'
    )

    if (!hasAccess) {
      if (insufficientRole) {
        return NextResponse.json({ 
          message: "Insufficient permissions. Editor or Owner role required." 
        }, { status: 403 })
      }
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Remove fields that shouldn't be updated directly
    const allowedUpdates = {
      title: updates.title,
      description: updates.description,
      category: updates.category,
      priority: updates.priority,
      status: updates.status,
      taskStatus: updates.taskStatus,
      assignee: updates.assignee,
    }

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key]
      }
    })

    // Update task in MongoDB
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email')

    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Update task in Pinecone (async, don't wait for it)
    upsertTaskToPinecone(updatedTask).catch(error => {
      console.error('Failed to update task in Pinecone:', error)
    })

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error("Task PUT error:", error)
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const { taskId } = await params

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 })
    }

    // Check if user has editor access to delete the task
    const { hasAccess, task, insufficientRole } = await checkTaskAccess(
      taskId, 
      decoded.userId, 
      'editor'
    )

    if (!hasAccess) {
      if (insufficientRole) {
        return NextResponse.json({ 
          message: "Insufficient permissions. Editor or Owner role required to delete tasks." 
        }, { status: 403 })
      }
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Delete the task from MongoDB
    await Task.findByIdAndDelete(taskId)

    // Update project task count
    if (task.projectId) {
      await Project.findByIdAndUpdate(task.projectId, {
        $inc: { taskCount: -1 },
      })
    }

    // Delete task from Pinecone (async, don't wait for it)
    deleteTaskFromPinecone(taskId).catch(error => {
      console.error('Failed to delete task from Pinecone:', error)
    })

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Task DELETE error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}