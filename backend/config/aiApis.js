require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiConfig = {
  url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  headers: {
    "Content-Type": "application/json",
    "X-goog-api-key":GEMINI_API_KEY
  }
  ,
  bodyFactory: (prompt) => ({
    contents: [{ parts: [{ text: prompt }] }]
  })
};




module.exports = {
  geminiConfig
};
