import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';
import { v4 as uuidv4 } from 'uuid';

const pc = new Pinecone({
  apiKey: "pcsk_2ZfMks_9jAq99bkxRTgVFK2SggAsdBQbzM5aNmDgcV9YEMEZAnMDc8Yv9ZkuqDVcyb5iQi",
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