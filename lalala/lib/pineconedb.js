// lib/pineconeUtils.js
import { Pinecone } from '@pinecone-database/pinecone'
import { pipeline } from '@xenova/transformers'

// Pinecone setup
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index('task-vector')

// Initialize the embedding model (1024 dimensions)
let embedder = null

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading 1024D embedder...')
    embedder = await pipeline('feature-extraction', 'Xenova/e5-large-v2')
    console.log('1024D Embedder loaded successfully')
  }
  return embedder
}

// Generate embedding for task content
async function generateTaskEmbedding(task) {
  try {
    const model = await getEmbedder()
    
    // Combine relevant task fields for embedding
    const taskText = [
      task.title || '',
      task.description || '',
      task.category || '',
      task.priority || '',
      task.status || '',
      task.assignee || ''
    ].filter(Boolean).join(' ')
    
    if (!taskText.trim()) {
      throw new Error('No text content available for embedding')
    }
    
    const output = await model(taskText, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)
    
    if (embedding.length !== 1024) {
      throw new Error(`Expected 1024 dimensions, got ${embedding.length}`)
    }
    
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Store/Update task in Pinecone
export async function upsertTaskToPinecone(task) {
  try {
    const embedding = await generateTaskEmbedding(task)
    
    const vector = {
      id: task._id.toString(),
      values: embedding,
      metadata: {
        userId: task.userId.toString(),
        title: task.title || '',
        description: task.description || '',
        category: task.category || '',
        priority: task.priority || '',
        status: task.status || '',
        taskStatus: task.taskStatus || '',
        assignee: task.assignee || '',
        projectId: task.projectId ? task.projectId.toString() : null,
        createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString()
      }
    }
    
    await index.upsert([vector])
    console.log(`Task ${task._id} synced to Pinecone successfully`)
  } catch (error) {
    console.error('Error syncing task to Pinecone:', error)
    // Don't throw here to avoid breaking the main operation
  }
}

// Delete task from Pinecone
export async function deleteTaskFromPinecone(taskId) {
  try {
    await index.deleteOne(taskId.toString())
    console.log(`Task ${taskId} deleted from Pinecone successfully`)
  } catch (error) {
    console.error('Error deleting task from Pinecone:', error)
    // Don't throw here to avoid breaking the main operation
  }
}

// Get embedder for search operations
export { getEmbedder }