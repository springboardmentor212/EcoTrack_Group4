const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const trackerController = require("../controllers/trackerController");
const goalController = require("../controllers/goalController");
const dashboardController = require("../controllers/dashboardController");

// Tracker Routes
router.post("/tracker/log", authMiddleware, trackerController.logActivity);
router.get("/tracker/history", authMiddleware, trackerController.getHistoricalActivities);

// Goals Routes
router.post("/goals/create", authMiddleware, goalController.createGoal);
router.get("/goals", authMiddleware, goalController.getGoals);

// Dashboard Routes
router.get("/dashboard", authMiddleware, dashboardController.getDashboardData);

module.exports = router;