// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  metadata: { type: Object }, // e.g. device info, location, etc.
});

module.exports = mongoose.model("Session", sessionSchema);
