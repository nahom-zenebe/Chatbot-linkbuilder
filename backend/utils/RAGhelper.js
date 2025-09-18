const { searchChroma } = require("../services/chromaService");
const { getGeminiResponse } = require("../services/geminiService");

async function getAnswerWithContext(userQuery) {
  console.log(`[RAG] Processing: "${userQuery}"`);

  // Get top 3 results from Chroma
  const topResults = await searchChroma(userQuery, 3);

  let contextSnippet;
  if (topResults.length) {
    // Always provide top-k completions to Gemini
    contextSnippet = topResults
      .map((res, idx) => `${idx + 1}. ${res.completion} (Distance: ${res.distance.toFixed(2)})`)
      .join("\n");
    console.log("[RAG] Using top Chroma completions as context for Gemini");
  } else {
    contextSnippet = "No related FAQs found.";
    console.log("[RAG] No Chroma results—context will be empty");
  }

  // Construct strict prompt instructing Gemini to ONLY use provided context
  const strictPrompt = `You are a precise support bot. Use ONLY the following context to answer the user query. 
Do NOT add general advice or hallucinate. If the answer is not present in the context, say "I don't know".

Context:
${contextSnippet}

Query: ${userQuery}

Response (keep under 50 words):`;

  const response = await getGeminiResponse(strictPrompt);
  console.log('[RAG] Gemini output:', response?.substring(0, 100) + '...');

  return response || "Sorry, I couldn't find that—try rephrasing.";
}

module.exports = { getAnswerWithContext };
