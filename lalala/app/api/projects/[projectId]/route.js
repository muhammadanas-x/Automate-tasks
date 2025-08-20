// app/api/projects/[projectId]/route.js
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import Task from "@/models/Task"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// Helper function to check if user has access to project
async function checkProjectAccess(projectId, userId, requiredRole = null) {
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { userId: userId }, // Legacy support
      { 'members.user': userId }, // New structure
    ]
  }).populate('members.user', 'name email')

  if (!project) {
    return { hasAccess: false, project: null, userRole: null }
  }

  // Find user's role in the project
  const member = project.members.find(m => 
    m.user && m.user._id.toString() === userId
  )
  
  const userRole = member ? member.role : 'owner' // fallback for legacy projects

  // Check if user has required role
  if (requiredRole) {
    const roleHierarchy = { viewer: 1, editor: 2, owner: 3 }
    const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole]
    
    if (!hasRequiredRole) {
      return { hasAccess: false, project, userRole, insufficientRole: true }
    }
  }

  return { hasAccess: true, project, userRole }
}

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

    const { hasAccess, project } = await checkProjectAccess(projectId, decoded.userId)

    if (!hasAccess) {
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

    // Check if user has editor or owner access
    const { hasAccess, project, insufficientRole } = await checkProjectAccess(
      projectId, 
      decoded.userId, 
      'editor'
    )

    if (!hasAccess) {
      if (insufficientRole) {
        return NextResponse.json({ 
          message: "Insufficient permissions. Editor or Owner role required." 
        }, { status: 403 })
      }
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
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

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).populate('members.user', 'name email')

    return NextResponse.json({ project: updatedProject }, { status: 200 })
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

    // Check if user has owner access (only owners can delete projects)
    const { hasAccess, project, insufficientRole } = await checkProjectAccess(
      projectId, 
      decoded.userId, 
      'owner'
    )

    if (!hasAccess) {
      if (insufficientRole) {
        return NextResponse.json({ 
          message: "Only project owners can delete projects" 
        }, { status: 403 })
      }
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: projectId })

    // Delete the project
    await Project.findOneAndDelete({ _id: projectId })

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