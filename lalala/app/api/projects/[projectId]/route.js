import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import Task from "@/models/Task"
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

    const { projectId } = params

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 })
    }

    const project = await Project.findOne({ 
      _id: projectId, 
      userId: decoded.userId 
    })

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error("Project GET error:", error)
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

    const { projectId } = params
    const updates = await req.json()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 })
    }

    // Remove fields that shouldn't be updated directly
    const allowedUpdates = {
      name: updates.name,
      description: updates.description,
    }

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key]
      }
    })

    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId: decoded.userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error("Project PUT error:", error)
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

    const { projectId } = await params

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 })
    }

    // Check if project exists and belongs to user
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: decoded.userId 
    })

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ 
      projectId: projectId, 
      userId: decoded.userId 
    })

    // Delete the project
    await Project.findOneAndDelete({ 
      _id: projectId, 
      userId: decoded.userId 
    })

    return NextResponse.json(
      { message: "Project and associated tasks deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Project DELETE error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}