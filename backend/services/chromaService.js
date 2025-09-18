const { ChromaClient } = require("chromadb");
const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
  embeddingFunction: new DefaultEmbeddingFunction(),
});

let collection;

async function initChroma() {
  if (!collection) {
    collection = await client.getOrCreateCollection({ name: "faq_dataset" });
    console.log('[Chroma] Initialized collection "faq_dataset"');
  }
}

async function addChromaEntry(entry) {
  await initChroma();
  const id = entry.id.toString();

  const existing = await collection.get({ ids: [id] });
  if (existing.ids?.includes(id)) {
    console.log(`[Chroma] Entry ${id} already exists—updating`);
    await collection.update({
      ids: [id],
      documents: [entry.prompt],
      metadatas: [{
        category: entry.category,
        prompt: entry.prompt,
        completion: entry.completion,
        tags: entry.tags.join(",")
      }]
    });
  } else {
    await collection.add({
      ids: [id],
      documents: [entry.prompt],
      metadatas: [{
        category: entry.category,
        prompt: entry.prompt,
        completion: entry.completion,
        tags: entry.tags.join(",")
      }]
    });
    console.log(`[Chroma] Added entry ${id}: "${entry.prompt}"`);
  }
}

// Search top-k results (default k=3) and return completions with distances
async function searchChroma(query, topK = 3) {
  await initChroma();
  const results = await collection.query({
    queryTexts: [query],
    nResults: topK,
    include: ["metadatas", "documents", "distances"],
  });

  if (!results.metadatas?.[0]?.length) {
    console.log(`[Chroma] MISS: No results for "${query}"`);
    return [];
  }

  // Map results to a structured array
  const mapped = results.metadatas[0].map((metadata, i) => ({
    completion: metadata.completion,
    category: metadata.category,
    tags: metadata.tags ? metadata.tags.split(",") : [],
    distance: results.distances?.[0]?.[i] ?? 1,
    prompt: metadata.prompt
  }));

  console.log(`[Chroma] Query "${query}" top-${topK} results:`, mapped);
  return mapped;
}

module.exports = { initChroma, addChromaEntry, searchChroma };
