const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import controllers with fallback check
const trackerController = require("../controllers/trackerController") || {};
const goalController = require("../controllers/goalController") || {};
const dashboardController = require("../controllers/dashboardController") || {};

// Helper safety wrapper to prevent router crash if a controller function is missing
const safeHandler = (handler) => {
  return typeof handler === "function" 
    ? handler 
    : (req, res) => res.status(501).json({ message: "Route handler not implemented" });
};

// Tracker Routes
router.post("/tracker/log", authMiddleware, safeHandler(trackerController.logActivity));
router.get("/tracker/history", authMiddleware, safeHandler(trackerController.getHistoricalActivities));
router.get("/tracker/summary", authMiddleware, safeHandler(trackerController.getSummary));

// Goals Routes - Handle both /api/goals and /api/goals/create
router.post("/goals", authMiddleware, safeHandler(goalController.createGoal));
router.post("/goals/create", authMiddleware, safeHandler(goalController.createGoal));
router.get("/goals", authMiddleware, safeHandler(goalController.getGoals));

// Dashboard Routes
router.get("/dashboard", authMiddleware, safeHandler(dashboardController.getDashboardData));

module.exports = router;