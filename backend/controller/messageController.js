
const  Message =require( "../model/Messagemodel.js");
const  { regexFAQ } =require( "../services/faqRules.js")
const  { searchChroma } =require( "../services/chromaService.js")
const  { getGeminiResponse } =require( "../services/geminiService.js")

const { getAnswerWithContext } = require("../utils/RAGhelper.js");

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    const userMessage = await Message.create({
      sessionId,
      sender: "user",
      text,
    });

    let botReply =
      regexFAQ(text) || 
      (await getAnswerWithContext(text)) || 
      "I’m here to help, but I didn’t quite understand that. Could you rephrase?";

    const botMessage = await Message.create({
      sessionId,
      sender: "bot",
      text: botReply,
    });

    res.json({ userMessage, botMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
