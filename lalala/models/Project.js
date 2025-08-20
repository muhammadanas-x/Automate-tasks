import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Legacy field - keep for backward compatibility
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // New multi-user support
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow null for invited users who haven't signed up yet
      },
      role: {
        type: String,
        enum: ['owner', 'editor', 'viewer'],
        default: 'editor',
      },
      email: {
        type: String, // store invited email (in case user hasn't signed up yet)
        required: true, // Make email required since we need it for invitations
        trim: true,
        lowercase: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  taskCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Add index for better query performance
ProjectSchema.index({ 'members.user': 1 })
ProjectSchema.index({ 'members.email': 1 })
ProjectSchema.index({ userId: 1 }) // Legacy support

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)