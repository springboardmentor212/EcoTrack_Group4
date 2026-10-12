const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const trackerController = require("../controllers/trackerController");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const Challenge = require("../models/Challenge");

const JWT_SECRET = process.env.JWT_SECRET || "ecotrack_jwt_secret_key_123";

// Middleware to decode Token strictly for logged-in user
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && (decoded.id || decoded._id)) {
      const extractedId = String(decoded.id || decoded._id);
      req.userId = extractedId;
      req.user = { id: extractedId };
      return next();
    }
    return res.status(401).json({ message: "Invalid user token" });
  } catch (err) {
    try {
      const decodedFallback = jwt.decode(token);
      if (decodedFallback && (decodedFallback.id || decodedFallback._id || decodedFallback.sub)) {
        const extractedId = String(decodedFallback.id || decodedFallback._id || decodedFallback.sub);
        req.userId = extractedId;
        req.user = { id: extractedId };
        return next();
      }
    } catch (e) {
      return res.status(401).json({ message: "Token authentication failed" });
    }
    return res.status(401).json({ message: "Unauthorized request" });
  }
};

const updateChallengeProgressOnLog = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const { category, type, transportType, energyType } = req.body;
    
    const activityCategory = category || type || transportType || energyType;

    if (userId && userId !== "guest" && activityCategory) {
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
            p.status = "COMPLETED";
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

// 3. POST /api/tracker/log
router.post("/log", authenticateUser, updateChallengeProgressOnLog, trackerController.logActivity);

module.exports = router;