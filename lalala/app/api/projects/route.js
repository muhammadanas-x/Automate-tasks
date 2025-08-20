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

    // Find projects where user is a member (either by userId or in members array)
    const projects = await Project.find({
      $or: [
        { userId: decoded.userId }, // Legacy support - if you still have old projects
        { 'members.user': decoded.userId }, // New multi-user structure
        { 'members.email': decoded.email } // For invited users who haven't been linked yet
      ]
    })
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 })

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
    
    // Create project with the creator as the first member with 'owner' role
    const projectData = {
      name: body.name,
      description: body.description,
      members: [
        {
          user: decoded.userId,
          role: 'owner',
          email: decoded.email // assuming email is in the JWT
        }
      ],
      taskCount: 0,
      // Keep userId for backward compatibility if needed
      userId: decoded.userId
    }

    const project = await Project.create(projectData)
    
    // Populate the member data before returning
    await project.populate('members.user', 'name email')
    
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}