const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// GET Report Summary Dashboard Data
router.get("/summary", authMiddleware, reportController.getReportSummary);

// GET Export Multi-page PDF Report File
router.get("/export", authMiddleware, reportController.exportReportPDF);

module.exports = router;