const express = require("express");
const router = express.Router();
const sessionController = require("../controller/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (require login)
router.post("/start", authMiddleware, sessionController.startSession);
router.put("/end/:sessionId", authMiddleware, sessionController.endSession);

module.exports = router;
