// app/api/tasks/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Project from "@/models/Project"
import jwt from "jsonwebtoken"

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const tasks = await Task.find({ userId: decoded.userId })
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
    const taskData = {
      ...body,
      userId: decoded.userId,
    }

    const task = await Task.create(taskData)

    // Update project task count
    if (taskData.projectId) {
      await Project.findByIdAndUpdate(taskData.projectId, {
        $inc: { taskCount: 1 },
      })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Tasks API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
