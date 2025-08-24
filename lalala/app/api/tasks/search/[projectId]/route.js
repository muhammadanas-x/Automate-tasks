// app/api/tasks/search/[projectId]/route.js
import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import jwt from 'jsonwebtoken'
import OpenAI from 'openai'


const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,

})

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY ,   baseURL: 'https://api.aimlapi.com/v1',})
const index = pc.index('task-vectors')


async function embed(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float', // makes sure we get normal JS numbers
  });

  // response.data[0].embedding is already number[]
  return response.data[0].embedding;
}

export async function GET(req, { params }) {
  try {
    // Check authentication
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get projectId from route parameters
    const { projectId } = await params
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID parameter required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const topK = parseInt(searchParams.get('topK') || '10')
    const minScore = parseFloat(searchParams.get('minScore') || '0.7')

    console.log('Search query:', query)
    console.log('Project ID:', projectId)
    console.log('User ID:', decoded.userId)
    console.log('TopK:', topK)
    console.log('MinScore:', minScore)
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }
    const queryVector = await embed(query)
    
    console.log('Embedding result shape:', queryVector.length)
    

    console.log('Querying Pinecone index...')
    
    const searchResults = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
      includeValues: false,
      filter: {
        projectId: projectId
      }
    })


    searchResults.matches.map((match) => console.log(match.metadata))

    console.log('Search completed successfully')
    console.log('Results found:', searchResults.matches?.length || 0)


    
    console.log(searchResults.matches)
    return NextResponse.json({
      success: true,
      query,
      projectId,
      tasks: searchResults,
      count: searchResults.length,
      totalFound: searchResults.matches?.length || 0,
      minScore
    })

  } catch (error) {
    console.error('Vercel search error details:', error)
    
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