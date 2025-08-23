// app/api/tasks/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Project from "@/models/Project"
import jwt from "jsonwebtoken"
import { Pinecone } from '@pinecone-database/pinecone'
import { pipeline } from '@xenova/transformers'


import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.OPENAI_API_KEY, // or pass key in another way
});
// Pinecone setup
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index('task-vectors')


async function embed(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float', // makes sure we get normal JS numbers
  });

  // response.data[0].embedding is already number[]
  return response.data[0].embedding;
}
// Generate embedding for task content
async function generateTaskEmbedding(task) {
  try {    
    // Combine relevant task fields for embedding
    const taskText = [
      task.title || '',
      task.description || '',
      task.category || '',
      task.priority || '',
      task.status || '',
      task.assignee || '',
      task.userId || "",
    ].filter(Boolean).join(' ')
    
    if (!taskText.trim()) {
      throw new Error('No text content available for embedding')
    }

    const embedding = await embed(taskText);    
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Store task in Pinecone
async function upsertTaskToPinecone(task) {
  try {
    const embedding = await generateTaskEmbedding(task)
    console.log(embedding)
    console.log(task.projectId)
    const vector = {
      id: task._id.toString(),
      values: embedding,
      metadata: {
        projectId: task.projectId ? task.projectId.toString() : '', // Handle cases where userId might not exist
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

    console.log(vector)
    
    await index.upsert([vector])
    console.log(`Task ${task._id} stored in Pinecone successfully`)
  } catch (error) {
    console.error('Error storing task in Pinecone:', error)
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

// Helper function to get user's accessible projects
async function getUserAccessibleProjects(userId) {
  return await Project.find({
    $or: [
      { userId: userId }, // Legacy support
      { 'members.user': userId }, // New structure
    ]
  }).select('_id')
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    // Get all projects user has access to
    const accessibleProjects = await getUserAccessibleProjects(decoded.userId)
    const projectIds = accessibleProjects.map(p => p._id)

    // Get tasks from projects user has access to, plus legacy tasks
    const tasks = await Task.find({
      $or: [
        { userId: decoded.userId }, // Legacy tasks
        { projectId: { $in: projectIds } } // Tasks from accessible projects
      ]
    }).populate('assignee', 'name email')

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error("Tasks API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const body = await req.json()

    // Verify user has access to the project (if projectId is provided)
    if (body.projectId) {
      const project = await Project.findOne({
        _id: body.projectId,
        $or: [
          { userId: decoded.userId }, // Legacy support
          { 'members.user': decoded.userId }, // New structure - user must be a member
        ]
      })

      if (!project) {
        return NextResponse.json(
          { message: "Project not found or access denied" },
          { status: 404 }
        )
      }

      // Check if user has at least editor permission
      const member = project.members.find(m => 
        m.user && m.user.toString() === decoded.userId
      )
      
      const userRole = member ? member.role : 'owner' // fallback for legacy projects
      
      if (!['owner', 'editor'].includes(userRole)) {
        return NextResponse.json({
          message: "Insufficient permissions. Editor or Owner role required to create tasks."
        }, { status: 403 })
      }
    }

    console.log(decoded)
    const taskData = {
      ...body,
      userId: decoded.userId, // Keep for backward compatibility
    }

    // Create task in MongoDB
    const task = await Task.create(taskData)

    // Update project task count
    if (taskData.projectId) {
      await Project.findByIdAndUpdate(taskData.projectId, {
        $inc: { taskCount: 1 },
      })
    }

    // Populate assignee data
    await task.populate('assignee', 'name email')

    // Store task in Pinecone (async, don't wait for it)
    upsertTaskToPinecone(task).catch(error => {
      console.error('Failed to store task in Pinecone:', error)
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Tasks API error:", error)
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