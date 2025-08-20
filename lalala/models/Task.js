import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
  taskStatus: String,

  assignee: {
    type: String,
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// ✅ Prevent recompiling model on hot reloads
export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
