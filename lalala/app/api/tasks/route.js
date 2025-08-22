import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';
import { v4 as uuidv4 } from 'uuid';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Use your existing index name
const index = pc.index('task-vector');

// Initialize the embedding model (this will be cached after first use)
let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading 1024D embedder...');
    // Using e5-large-v2 (1024 dimensions) to match your index
    embedder = await pipeline('feature-extraction', 'Xenova/e5-large-v2');
    console.log('1024D Embedder loaded successfully');
  }
  return embedder;
}

export async function POST(req) {
  try {
    const tasks = await req.json(); // may be [{}] or {}

    // ensure we always have an array
    const taskArray = Array.isArray(tasks) ? tasks : [tasks];

    const model = await getEmbedder();
    const vectors = [];

    for (const task of taskArray) {
      // generate UUID if none provided
      const id = task.id || uuidv4();

      // Create meaningful text for embedding
      const text = `${task.title || ''} ${task.description || ''} ${task.taskStatus || ''}`.trim();
      
      // Generate embeddings using the transformer model
      const output = await model(text, { pooling: 'mean', normalize: true });
      
      // Extract the embedding vector (1024 dimensions for e5-large-v2)
      const embedding = Array.from(output.data);

      vectors.push({
        id,
        values: embedding, // No padding needed - use native 384 dimensions
        metadata: { 
          ...task, 
          id,
          text // Store the text used for embedding for reference
        },
      });
    }

    await index.upsert(vectors);

    return NextResponse.json({ 
      success: true, 
      count: vectors.length,
      dimensions: vectors[0]?.values.length || 0
    }, { status: 201 });
  } catch (err) {
    console.error('Embedding error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const deleteAll = searchParams.get('deleteAll') === 'true';
    
    if (deleteAll) {
      // Delete all vectors in the index
      await index.deleteAll();
      
      return NextResponse.json({ 
        success: true, 
        message: "All vectors deleted from index"
      }, { status: 200 });
    } else {
      // Delete specific vectors by IDs
      const body = await req.json();
      const ids = Array.isArray(body) ? body : body.ids || [body.id];
      
      if (!ids || ids.length === 0) {
        return NextResponse.json({ 
          error: "No IDs provided for deletion" 
        }, { status: 400 });
      }

      // Filter out any undefined/null IDs
      const validIds = ids.filter(id => id != null);
      
      if (validIds.length === 0) {
        return NextResponse.json({ 
          error: "No valid IDs provided for deletion" 
        }, { status: 400 });
      }

      await index.deleteMany(validIds);

      return NextResponse.json({ 
        success: true, 
        deletedCount: validIds.length,
        deletedIds: validIds
      }, { status: 200 });
    }
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}