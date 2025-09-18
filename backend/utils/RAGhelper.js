const { searchChroma } = require("../services/chromaService");
const { getGeminiResponse } = require("../services/geminiService");

async function getAnswerWithContext(userQuery) {
  const context = await searchChroma(userQuery);
  console.log(context)

  // If Chroma has context, pass it to Gemini
  const prompt = context
    ? `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${userQuery}`
    : userQuery;

  return await getGeminiResponse(prompt);
}

module.exports = { getAnswerWithContext };
