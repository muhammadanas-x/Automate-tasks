// app/api/tasks/search/route.js
import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { pipeline } from '@xenova/transformers'
import jwt from 'jsonwebtoken'
import OpenAI from 'openai'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index('task-vector')
// Initialize the embedding model (1024 dimensions)


const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY ,   baseURL: 'https://api.aimlapi.com/v1',})

async function embed(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    encoding_format: 'float', // makes sure we get normal JS numbers
  });

  // response.data[0].embedding is already number[]
  return response.data[0].embedding;
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
    
    // Generate 1024D embedding
    const output = await embed(query)
    
    console.log('Embedding result shape:', queryVector.length)
    

    console.log('Querying Pinecone index...')
    
    console.log(decoded.userId)
    // Search with user filter to only return tasks belonging to the authenticated user
    const searchResults = await index.query({
      vector: output,
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