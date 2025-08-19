// app/api/tasks/[taskId]/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Project from "@/models/Project"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

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

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: decoded.userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

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

    // Delete the task
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
