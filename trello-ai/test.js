// index.mjs
import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline } from '@xenova/transformers';

// -------------------------------------------------
// 1.  Pinecone client – replace with your key
// -------------------------------------------------
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? 'pcsk_2ZfMks_9jAq99bkxRTgVFK2SggAsdBQbzM5aNmDgcV9YEMEZAnMDc8Yv9ZkuqDVcyb5iQi' });
const index = pc.index('tasks-vectors');

// -------------------------------------------------
// 2.  Sentence encoder (free, runs locally)
// -------------------------------------------------
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
function to1024(vec384) {
  const padded = new Array(1024).fill(0);
  padded.splice(0, 384, ...vec384);   // copy first 384 values
  return padded;
}
// -------------------------------------------------
// 3.  Upsert helper
// -------------------------------------------------
async function upsertTask(task) {
  const text = `${task.title} ${task.description} ${task.taskStatus}`;
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  const vector384 = Array.from(output.data);
  const vector1024 = to1024(vector384);   // <- pad

  await index.upsert([{
    id: task.title,
    values: vector1024,
    metadata: task
  }]);
}

// -------------------------------------------------
// 4.  Your data
// -------------------------------------------------
const tasks = [
  {
    category: "Development",
    title: "Build login page",
    description: "Create a responsive login page with email/password validation.",
    priority: "high",
    taskStatus: "in progress",
    assignee: "Alice",
    status: "todo"
  },
  {
    category: "Design",
    title: "Design landing page hero section",
    description: "engro",
    priority: "medium",
    taskStatus: "pending",
    assignee: "Bob",
    status: "todo"
  },
  {
    category: "Testing",
    title: "Write unit tests for API",
    description: "Write unit tests for the user authentication API endpoints.",
    priority: "high",
    taskStatus: "pending",
    assignee: "Charlie",
    status: "todo"
  }
];

// -------------------------------------------------
// 5.  Run upsert
// -------------------------------------------------
console.log('Upserting tasks …');
await Promise.all(tasks.map(upsertTask));
console.log('Tasks stored in Pinecone.');

// -------------------------------------------------
// 6.  Example semantic search
// -------------------------------------------------
const query = 'engro';
const qVec384 = Array.from(
  (await embedder(query, { pooling: 'mean', normalize: true })).data
);
const qVec1024 = to1024(qVec384);
const results = await index.query({ vector: qVec1024, topK: 3, includeMetadata: true });

console.log('\nSearch results for "' + query + '":');
results.matches.forEach((m, i) =>
  console.log(`${i + 1}.`, m.metadata.title, `(score: ${m.score.toFixed(3)})`)
);