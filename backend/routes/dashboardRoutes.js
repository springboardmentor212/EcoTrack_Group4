const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Route (Requires Login Token)
router.get("/", authMiddleware, getDashboardData);

module.exports = router;