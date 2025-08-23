// app/api/tasks/search/route.js
import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { pipeline } from '@xenova/transformers'
import jwt from 'jsonwebtoken'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index('task-vector')

// Initialize the embedding model (1024 dimensions)
let embedder = null

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading 1024D embedder...')
    // Using e5-large-v2 (1024 dimensions) to match your index
    embedder = await pipeline('feature-extraction', 'Xenova/e5-large-v2')
    console.log('1024D Embedder loaded successfully')
  }
  return embedder
}

export async function GET(req) {
  try {
    // Check authentication
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const topK = parseInt(searchParams.get('topK') || '10')
    const minScore = parseFloat(searchParams.get('minScore') || '0.7')

    console.log(query)
    console.log(topK)
    console.log(minScore)
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    console.log('Search query:', query)
    console.log('User ID:', decoded.userId)
    
    // Get the 1024D embedder
    const model = await getEmbedder()
    
    // Generate 1024D embedding
    const output = await model(query, { pooling: 'mean', normalize: true })
    const queryVector = Array.from(output.data)
    
    console.log('Embedding result shape:', queryVector.length)
    
    // Verify we have 1024 dimensions
    if (queryVector.length !== 1024) {
      throw new Error(`Expected 1024 dimensions, got ${queryVector.length}`)
    }

    console.log('Querying Pinecone index...')
    
    console.log(decoded.userId)
    console.log(queryVector)
    // Search with user filter to only return tasks belonging to the authenticated user
    const searchResults = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
      includeValues: false,
      filter: {
        projectId: decoded.userId
      }
    })

    console.log('Search completed successfully')
    console.log('Results found:', searchResults.matches?.length || 0)

    // Filter results by minimum score if specified
    const filteredResults = searchResults.matches?.filter(match => 
      match.score >= minScore
    ) || []

    // Enhance results with formatted metadata
    const enhancedResults = filteredResults.map(match => ({
      id: match.id,
      score: match.score,
      task: {
        id: match.id,
        title: match.metadata?.title || '',
        description: match.metadata?.description || '',
        category: match.metadata?.category || '',
        priority: match.metadata?.priority || '',
        status: match.metadata?.status || '',
        taskStatus: match.metadata?.taskStatus || '',
        assignee: match.metadata?.assignee || '',
        projectId: match.metadata?.projectId || null,
        createdAt: match.metadata?.createdAt || null,
        updatedAt: match.metadata?.updatedAt || null
      }
    }))

    return NextResponse.json({
      success: true,
      query,
      results: enhancedResults,
      count: enhancedResults.length,
      totalFound: searchResults.matches?.length || 0,
      minScore
    })

  } catch (error) {
    console.error('Search error details:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ 
        message: "Invalid token" 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}