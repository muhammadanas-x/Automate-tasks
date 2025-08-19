// app/api/tasks/search/route.js
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';

const pc = new Pinecone({
  apiKey: "pcsk_2ZfMks_9jAq99bkxRTgVFK2SggAsdBQbzM5aNmDgcV9YEMEZAnMDc8Yv9ZkuqDVcyb5iQi",
});

const index = pc.index('task-vector'); // Your existing index name

// Initialize the embedding model (1024 dimensions)
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    console.log('Search query:', query);
    
    // Get the 1024D embedder
    const model = await getEmbedder();
    
    // Generate 1024D embedding
    const output = await model(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);
    
    console.log('Embedding result shape:', queryVector.length);
    console.log('Query vector length:', queryVector.length, 'First few values:', queryVector.slice(0, 5));
    
    // Verify we have 1024 dimensions
    if (queryVector.length !== 1024) {
      throw new Error(`Expected 1024 dimensions, got ${queryVector.length}`);
    }

    console.log('Querying Pinecone index...');
    
    const searchResults = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
      includeValues: false
    });

    console.log('Search completed successfully');
    console.log('Results found:', searchResults.matches?.length || 0);

    return NextResponse.json({
      success: true,
      query,
      results: searchResults.matches || [],
      count: searchResults.matches?.length || 0
    });

  } catch (error) {
    console.error('Search error details:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}