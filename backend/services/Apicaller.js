const axios = require("axios");

async function getAIResponse(apiUrl, apiHeaders, requestBody) {
  try {
    const response = await axios.post(apiUrl, requestBody, { headers: apiHeaders });

    const candidates = response.data?.candidates || [];
    if (candidates.length > 0) {
      const textParts = candidates[0].content?.parts?.map(p => p.text).filter(Boolean);
      if (textParts && textParts.length > 0) {
        return textParts.join(" ");
      }
    }

    // fallback for APIs that return a top-level text field
    if (response.data?.text) return response.data.text;

    console.error("AI API response format unexpected:", response.data);
    return null;
  } catch (err) {
    console.error("AI API Error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { getAIResponse };
