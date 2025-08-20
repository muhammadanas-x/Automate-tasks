// app/api/projects/[projectId]/members/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

export async function POST(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const { projectId } = await params
    const { email, role = 'editor' } = await req.json()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find the project and check if user has owner or editor permissions
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { userId: decoded.userId }, // Legacy support
        { 'members.user': decoded.userId }
      ]
    }).populate('members.user', 'name email')

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    // Check if current user has permission to add members (owner or editor)
    const currentUserMember = project.members.find(m => 
      m.user && m.user._id.toString() === decoded.userId
    )
    
    const currentUserRole = currentUserMember ? currentUserMember.role : 'owner' // fallback for legacy
    
    if (!['owner', 'editor'].includes(currentUserRole)) {
      return NextResponse.json({ 
        message: "Insufficient permissions. Only owners and editors can add members." 
      }, { status: 403 })
    }

    // Check if member already exists
    const existingMember = project.members.find(
      member => member.email === email.toLowerCase()
    )
    
    if (existingMember) {
      return NextResponse.json({ 
        message: "This person is already a member of the project" 
      }, { status: 400 })
    }

    // Try to find existing user by email
    let existingUser = await User.findOne({ email: email.toLowerCase() })
    
    const newMember = {
      email: email.toLowerCase(),
      role,
      ...(existingUser && { user: existingUser._id })
    }

    // Add member to project
    project.members.push(newMember)
    await project.save()

    // Populate the new member data for response
    await project.populate('members.user', 'name email')
    
    const addedMember = project.members[project.members.length - 1]

    return NextResponse.json({ 
      message: 'Member added successfully', 
      member: addedMember 
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

// GET members of a project
export async function GET(req, { params }) {
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

    // Find the project and check access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { userId: decoded.userId }, // Legacy support
        { 'members.user': decoded.userId }
      ]
    }).populate('members.user', 'name email')

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      members: project.members 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 })
  }
}