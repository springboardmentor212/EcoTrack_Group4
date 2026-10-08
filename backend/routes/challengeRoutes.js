const express = require("express");
const router = express.Router();
const Challenge = require("../models/Challenge");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const User = require("../models/User");
const Tracker = require("../models/Tracker");
const authMiddleware = require("../middleware/authMiddleware");

// Level Mapping Configuration
const LEVEL_CONFIG = [
  { level: 1, title: "Eco Starter", icon: "🌱", nextTitle: "Eco Learner" },
  { level: 2, title: "Eco Learner", icon: "🌿", nextTitle: "Green Helper" },
  { level: 3, title: "Green Helper", icon: "🍃", nextTitle: "Waste Reducer" },
  { level: 4, title: "Waste Reducer", icon: "♻️", nextTitle: "Eco Defender" },
  { level: 5, title: "Eco Defender", icon: "🛡", nextTitle: "Energy Saver" },
  { level: 6, title: "Energy Saver", icon: "⚡", nextTitle: "Tree Planter" },
  { level: 7, title: "Tree Planter", icon: "🌲", nextTitle: "Climate Warrior" },
  { level: 8, title: "Climate Warrior", icon: "🌍", nextTitle: "Eco Guardian" },
  { level: 9, title: "Eco Guardian", icon: "👑", nextTitle: "Planet Savior" },
  { level: 10, title: "Planet Savior", icon: "🌌", nextTitle: "Pinnacle Reached" },
];

// Helper: Normalize tag or category to Standard Tracker Categories
const normalizeCategory = (tag, title) => {
  const text = `${tag || ""} ${title || ""}`.toLowerCase();

  if (text.includes("transport") || text.includes("bike") || text.includes("walk") || text.includes("commute") || text.includes("carpool")) {
    return "transport";
  }
  if (text.includes("energy") || text.includes("light") || text.includes("charger") || text.includes("solar") || text.includes("ac") || text.includes("power") || text.includes("bulb") || text.includes("stairs") || text.includes("elevator")) {
    return "energy";
  }
  if (text.includes("food") || text.includes("diet") || text.includes("meal") || text.includes("meatless") || text.includes("organic")) {
    return "food";
  }
  if (text.includes("waste") || text.includes("plastic") || text.includes("bag") || text.includes("recycle") || text.includes("compost") || text.includes("refill") || text.includes("clean") || text.includes("upcycl")) {
    return "waste";
  }
  if (text.includes("water") || text.includes("tap") || text.includes("rainwater") || text.includes("shower") || text.includes("plant") || text.includes("reforestation") || text.includes("tree") || text.includes("garden")) {
    return "water";
  }

  return "overall";
};

// Helper: Calculate progress dynamically ONLY for JOINED challenges AFTER joining date
async function syncChallengeProgressFromLogs(userId) {
  try {
    const userJoined = await ChallengeParticipation.find({
      userId: String(userId),
      status: "JOINED",
    });

    if (!userJoined || userJoined.length === 0) return;

    const userLogs = await Tracker.find({
      $or: [{ userId: String(userId) }, { userId: "guest" }],
    }).lean();

    for (let participation of userJoined) {
      const challenge = await Challenge.findOne({
        challengeId: participation.challengeId,
      }).lean();

      if (!challenge) continue;

      const challengeCategory = normalizeCategory(challenge.tag, challenge.title);
      const targetGoal = Number(challenge.targetGoal || 1);

      const joinedDate = participation.createdAt
        ? new Date(participation.createdAt).getTime()
        : 0;

      let matchedLogsCount = 0;

      userLogs.forEach((log) => {
        const logTime = log.createdAt
          ? new Date(log.createdAt).getTime()
          : log.activityDate
          ? new Date(log.activityDate).getTime()
          : 0;

        // Skip logs created BEFORE joining the challenge
        if (joinedDate > 0 && logTime < joinedDate - 5000) {
          return;
        }

        const logCategory = normalizeCategory(log.category, log.activityType);
        const mode = log.activityMode || (Number(log.carbonSaved) > 0 ? "saving" : "emission");

        // STRICT REQUIREMENT: Progress ONLY moves if activityMode is 'saving'
        if (mode !== "saving") {
          return;
        }

        // Category Matching
        const categoryMatches =
          challengeCategory === "overall" || logCategory === challengeCategory;

        if (categoryMatches) {
          matchedLogsCount += 1;
        }
      });

      const finalProgress = Math.min(targetGoal, matchedLogsCount);
      let newStatus = "JOINED";

      if (finalProgress >= targetGoal) {
        newStatus = "COMPLETED";
      }

      await ChallengeParticipation.updateOne(
        { _id: participation._id },
        { $set: { progress: finalProgress, status: newStatus } }
      );
    }
  } catch (err) {
    console.error("Error syncing challenge progress from logs:", err);
  }
}

// Helper Function: Calculates points for both COMPLETED & CLAIMED challenges
async function evaluateUserLevelProgress(userId) {
  await syncChallengeProgressFromLogs(userId);

  let user = await User.findById(userId);
  if (!user) {
    return {
      userLevelDetails: {
        level: 1,
        title: "Eco Starter",
        icon: "🌱",
        currentXP: 0,
        levelMaxXP: 500,
        progressPercent: 0,
        nextLevelTitle: "Eco Learner",
      },
      user: { ecoPoints: 0, xp: 0 },
    };
  }

  const validParticipations = await ChallengeParticipation.find({
    userId: String(userId),
    status: { $in: ["COMPLETED", "CLAIMED"] },
  }).lean();

  const validIds = validParticipations.map((p) => p.challengeId);
  const validChallenges = await Challenge.find({
    challengeId: { $in: validIds },
  }).lean();

  const realEcoPoints = validChallenges.reduce(
    (sum, c) => sum + (c.rewardPoints || 0),
    0
  );
  const realXP = validChallenges.reduce(
    (sum, c) => sum + (c.rewardXP || 0),
    0
  );

  user.ecoPoints = realEcoPoints;
  user.xp = realXP;
  await user.save();

  let currentLevel = user.level || 1;
  let dbLevelChallenges = await Challenge.find({
    levelRequired: currentLevel,
  }).lean();
  const challengeIds = dbLevelChallenges.map((c) => c.challengeId);

  const completedInLevel = await ChallengeParticipation.countDocuments({
    userId: String(userId),
    challengeId: { $in: challengeIds },
    status: { $in: ["COMPLETED", "CLAIMED"] },
  });

  if (completedInLevel >= 4 && currentLevel < 10) {
    currentLevel += 1;
    user.level = currentLevel;
    await user.save();
    return evaluateUserLevelProgress(userId);
  }

  const currentConfig =
    LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];
  const progressPercent = Math.min(
    100,
    Math.round((completedInLevel / 4) * 100)
  );

  return {
    userLevelDetails: {
      level: currentConfig.level,
      title: currentConfig.title,
      icon: currentConfig.icon,
      currentXP: realXP,
      levelMaxXP: currentLevel * 500,
      completedInLevel,
      totalInLevel: 4,
      progressPercent,
      nextLevelTitle: currentConfig.nextTitle,
    },
    user: {
      ...user.toObject(),
      ecoPoints: realEcoPoints,
      xp: realXP,
    },
  };
}

// 1. GET /api/challenges/available
router.get("/available", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { userLevelDetails, user } = await evaluateUserLevelProgress(userId);

    const activeLevelChallenges = await Challenge.find({
      levelRequired: userLevelDetails.level,
    }).lean();

    res.json({
      userLevelDetails,
      ecoPoints: user.ecoPoints,
      xp: user.xp,
      challenges: activeLevelChallenges,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET /api/challenges/my-status
router.get("/my-status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const participations = await ChallengeParticipation.find({
      userId: String(userId),
    }).lean();
    res.json(participations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET /api/challenges/counts
router.get("/counts", async (req, res) => {
  try {
    const counts = await ChallengeParticipation.aggregate([
      { $match: { status: {$in: ["JOINED", "COMPLETED", "CLAIMED"] } } },
      { $group: { _id: "$challengeId", count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. POST /api/challenges/join
router.post("/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { challengeId } = req.body;

    await ChallengeParticipation.updateOne(
      { userId: String(userId), challengeId },
      { $setOnInsert: { status: "JOINED", progress: 0, createdAt: new Date() } },
      { upsert: true }
    );

    res.json({ message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. POST /api/challenges/claim-reward
router.post("/claim-reward", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { challengeId } = req.body;

    await ChallengeParticipation.updateOne(
      { userId: String(userId), challengeId },
      { $set: { status: "CLAIMED" } }
    );

    const { userLevelDetails, user } = await evaluateUserLevelProgress(userId);

    res.json({
      ecoPoints: user.ecoPoints,
      xp: user.xp,
      currentLevel: userLevelDetails.level,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;