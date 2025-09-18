const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const authMiddleware= require("../middleware/authMiddleware")

// Protected routes
router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/:sessionId", authMiddleware, messageController.getSessionMessages);

module.exports = router;
