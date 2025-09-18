// controllers/sessionController.js
const Session = require("../model/Session");

exports.startSession = async (req, res) => {
  try {
    const session = await Session.create({ userId: req.user.id });
    res.status(201).json({ message: "Session started", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { isActive: false, endedAt: Date.now() },
      { new: true }
    );

    res.json({ message: "Session ended", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
