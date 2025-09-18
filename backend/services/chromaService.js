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
    console.log("Chroma collection initialized.");
  }
}

async function addChromaEntry(entry) {
  await initChroma();

  if (!entry.id || !entry.prompt || !entry.completion) {
    throw new Error("Entry must have id, prompt, and completion");
  }

  await collection.add({
    ids: [entry.id.toString()],
    documents: [entry.prompt],
    metadatas: [
      {
        prompt: entry.prompt,
        completion: entry.completion,
        category: entry.category || "",
        tags: entry.tags ? entry.tags.join(",") : "",
      },
    ],
  });

  console.log(`Entry ${entry.id} added successfully.`);
}


async function searchChroma(query) {
  await initChroma();

  const results = await collection.query({
    queryTexts: [query],
    nResults: 1,
    include: ["metadatas", "distances", "documents", "embeddings"],
  });

  console.log("Query results:", JSON.stringify(results, null, 2));

  // Fallback to first metadata entry if distances empty
  let metadata;
  if (results.metadatas?.[0]?.length > 0) {
    metadata = results.metadatas[0][0];
    return metadata.completion || null;
  }

  return null;
}

module.exports = { initChroma, addChromaEntry, searchChroma };
