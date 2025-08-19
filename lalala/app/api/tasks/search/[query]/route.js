import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedder } from '@/lib/embedder';

const pc = new Pinecone({ apiKey: "pcsk_2ZfMks_9jAq99bkxRTgVFK2SggAsdBQbzM5aNmDgcV9YEMEZAnMDc8Yv9ZkuqDVcyb5iQi" });
const index = pc.index('tasks-st');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    console.log(searchParams)
    const query = searchParams.get('query');
    if (!query) {
      return NextResponse.json({ error: 'Missing query param' }, { status: 400 });
    }

    const embedder = await getEmbedder();
    const qVec = Array.from(
      (await embedder(query, { pooling: 'mean', normalize: true })).data
    );

    const res = await index.query({
      vector: qVec,
      topK: 3,
      includeMetadata: true
    });

    const best = res.matches?.[0];
    if (!best) {
      return NextResponse.json({ message: 'No match' }, { status: 404 });
    }

    // return the full task object
    return NextResponse.json(best.metadata, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}