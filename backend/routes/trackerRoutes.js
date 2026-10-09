const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const trackerController = require("../controllers/trackerController");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const Challenge = require("../models/Challenge");

// Middleware to decode Token (Works for JWT & Google Auth Tokens)
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
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

// Helper middleware to update joined challenge progress when logging carbon activities
const updateChallengeProgressOnLog = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const { category, type, transportType, energyType } = req.body;
    
    const activityCategory = category || type || transportType || energyType;

    if (userId && userId !== "guest" && activityCategory) {
      // Category Mapping to Challenge Tags
      let matchedTags = [];
      const catLower = String(activityCategory).toLowerCase();

      if (catLower.includes("transport") || catLower.includes("travel") || catLower.includes("vehicle") || catLower.includes("bike")) {
        matchedTags = ["Transport", "Health & Eco"];
      } else if (catLower.includes("energy") || catLower.includes("electricity") || catLower.includes("light")) {
        matchedTags = ["Energy", "Energy Saving"];
      } else if (catLower.includes("waste") || catLower.includes("food") || catLower.includes("plastic")) {
        matchedTags = ["Waste Reduction", "Sustainability", "Diet"];
      } else {
        matchedTags = [activityCategory];
      }

      const matchingChallenges = await Challenge.find({ tag: { $in: matchedTags } }).lean();
      const challengeIds = matchingChallenges.map((c) => c.challengeId);

      if (challengeIds.length > 0) {
        const activeParticipations = await ChallengeParticipation.find({
          userId,
          challengeId: { $in: challengeIds },
          status: "JOINED",
        });

        for (let p of activeParticipations) {
          const challenge = matchingChallenges.find((c) => c.challengeId === p.challengeId);
          if (!challenge) continue;

          p.progress = (p.progress || 0) + 1;
          if (p.progress >= challenge.targetGoal) {
            p.progress = challenge.targetGoal;
            p.status = "COMPLETED"; // Ready to claim reward
          }
          await p.save();
        }
      }
    }
  } catch (err) {
    console.error("Auto Challenge Progress Error:", err.message);
  }
  next();
};

// 1. GET /api/tracker/history
router.get("/history", authenticateUser, trackerController.getHistory);

// 2. GET /api/tracker/summary
router.get("/summary", authenticateUser, trackerController.getSummary);

// 3. POST /api/tracker/log (Runs tracker controller & auto updates challenge progress)
router.post("/log", authenticateUser, updateChallengeProgressOnLog, trackerController.logActivity);

module.exports = router;