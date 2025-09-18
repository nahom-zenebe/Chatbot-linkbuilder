const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const authMiddleware= require("../middleware/authMiddleware")


// Protected routes
router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/:sessionId", authMiddleware, messageController.getSessionMessages);
router.put('/:messageId',messageController.updateFeedback)
module.exports = router;
