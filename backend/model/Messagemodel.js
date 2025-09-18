// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sessionId: { type:String, required: true },
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  intent: { type: String }, 
  metadata: { type: Object }, 
});

module.exports = mongoose.model("Message", messageSchema);
