// app/api/projects/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
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

    const projects = await Project.find({ userId: decoded.userId })
    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
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
    const projectData = {
      ...body,
      userId: decoded.userId,
    }

    const project = await Project.create(projectData)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
