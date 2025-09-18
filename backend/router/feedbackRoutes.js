const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.post("/", authMiddleware, feedbackController.submitFeedback);
router.get("/:messageId", authMiddleware, feedbackController.getMessageFeedback);

module.exports = router;
