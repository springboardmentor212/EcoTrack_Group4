const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const trackerController = require("../controllers/trackerController");

// Middleware to decode Token (Works for JWT & Google Auth Tokens)
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Authorization header illana "guest" ah treat panna fallback
  if (!authHeader) {
    req.userId = "guest";
    req.user = { id: "guest" };
    return next();
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.decode(token);
    if (decoded) {
      const extractedId = String(decoded.id || decoded._id || decoded.sub || decoded.email || "guest");
      req.userId = extractedId;
      req.user = { id: extractedId };
      return next();
    }
    req.userId = "guest";
    req.user = { id: "guest" };
    return next();
  } catch (err) {
    req.userId = "guest";
    req.user = { id: "guest" };
    return next();
  }
};

// 1. GET /api/tracker/history
router.get("/history", authenticateUser, trackerController.getHistory);

// 2. GET /api/tracker/summary
router.get("/summary", authenticateUser, trackerController.getSummary);

// 3. POST /api/tracker/log
router.post("/log", authenticateUser, trackerController.logActivity);

module.exports = router;