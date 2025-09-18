const { searchChroma } = require("../services/chromaService");
const { geminiConfig } = require("../config/aiApis");
const { getAIResponse } = require("../services/Apicaller"); 

async function getAnswerWithContext(userQuery) {
  console.log(`[RAG] Processing: "${userQuery}"`);

  const topResults = await searchChroma(userQuery, 3);

  const contextSnippet = topResults.length
    ? topResults.map((res, idx) => `${idx + 1}. ${res.completion} (Distance: ${res.distance.toFixed(2)})`).join("\n")
    : "No related FAQs found.";

  const strictPrompt = `You are a helpful and precise support bot. Use the following context to answer the user query.
- Base your answer on the context as much as possible.
- If the context partially answers the query, you may provide concise, relevant advice or guidance without making things up.
- Do NOT hallucinate information.
- Keep your response clear and actionable.

Context:
${contextSnippet}

Query: ${userQuery}

Response (keep under 70 words, include helpful advice if needed):`;

  const response = await getAIResponse(
    geminiConfig.url,
    geminiConfig.headers,
    geminiConfig.bodyFactory(strictPrompt)
  );

  console.log('[RAG] AI output:', response?.substring(0, 100) + '...');
  return response || "Sorry, I couldn't find that—try rephrasing.";
}

module.exports = { getAnswerWithContext };
