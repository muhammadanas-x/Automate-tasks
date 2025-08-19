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

    const { projectId } = params

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

    // Get all tasks for this project
    const tasks = await Task.find({ 
      projectId: projectId, 
      userId: decoded.userId 
    }).sort({ createdAt: -1 })

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error("Project tasks GET error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}