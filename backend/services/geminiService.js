const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function getGeminiResponse(prompt) {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    const candidate = response.data?.candidates?.[0];
    if (!candidate) return null;

    // Correctly access parts array inside content object
    const textParts = candidate.content?.parts?.map(part => part.text).filter(Boolean);

    if (textParts && textParts.length > 0) {
      return textParts.join(" "); // join all text parts into a single string
    } else {
      console.error("Gemini content.parts missing or empty:", candidate.content);
      return null;
    }
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    return null;
  }
}



module.exports = { getGeminiResponse };