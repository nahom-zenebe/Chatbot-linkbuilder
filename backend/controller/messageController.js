
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


exports.updateFeedback = async (req, res) => {
  try {
    const { helpful } = req.body;
    const {messageId}=req.params

    if (!messageId) {
      return res.status(400).json({ error: "messageId is required" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { helpful },
      { new: true } // returns the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Error updating feedback" });
  }
};
