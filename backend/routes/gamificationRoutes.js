const express = require("express");
const router = express.Router();
const { getUserGamification } = require("../controllers/gamificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Ensure getUserGamification is a valid function here
router.get("/", authMiddleware, getUserGamification);

module.exports = router;