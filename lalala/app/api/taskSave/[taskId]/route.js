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
        userId: task.userId.toString(),
        title: task.title || '',
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || '',
        status: task.status || '',
        taskStatus: task.taskStatus || '',
        assignee: task.assignee || '',
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

    const task = await Task.findOne({ 
      _id: taskId, 
      userId: decoded.userId 
    })

    if (!task) {
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
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: decoded.userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Update task in Pinecone (async, don't wait for it)
    upsertTaskToPinecone(task).catch(error => {
      console.error('Failed to update task in Pinecone:', error)
    })

    return NextResponse.json({ task }, { status: 200 })
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

    // First find the task to get the projectId before deleting
    const task = await Task.findOne({ 
      _id: taskId, 
      userId: decoded.userId 
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Delete the task from MongoDB
    await Task.findOneAndDelete({ 
      _id: taskId, 
      userId: decoded.userId 
    })

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