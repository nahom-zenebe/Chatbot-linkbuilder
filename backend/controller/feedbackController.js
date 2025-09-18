// controllers/feedbackController.js
const Feedback = require("../model/Feedbackmodel");

exports.submitFeedback = async (req, res) => {
  try {
    const { messageId, rating, comment } = req.body;

    const feedback = await Feedback.create({
      messageId,
      userId: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessageFeedback = async (req, res) => {
  try {
    const { messageId } = req.params;
    const feedback = await Feedback.find({ messageId });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
