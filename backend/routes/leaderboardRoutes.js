const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ChallengeParticipation = require("../models/ChallengeParticipation");

// GET /api/leaderboard - Calculate points & rank based on completed points and joined count
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("fullName name email level").lean();

    // 1. Aggregate completed/claimed points per user
    const completedScores = await ChallengeParticipation.aggregate([
      { $match: { status: { $in: ["COMPLETED", "CLAIMED"] } } },
      {
        $lookup: {
          from: "challenges",
          localField: "challengeId",
          foreignField: "challengeId",
          as: "challengeInfo",
        },
      },
      { $unwind: "$challengeInfo" },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$challengeInfo.rewardPoints" },
        },
      },
    ]);

    // 2. Count active joined challenges per user (for tie-breaker)
    const activeParticipations = await ChallengeParticipation.aggregate([
      { $match: { status: { $in: ["JOINED", "COMPLETED", "CLAIMED"] } } },
      {
        $group: {
          _id: "$userId",
          joinedCount: { $sum: 1 },
        },
      },
    ]);

    const scoreMap = {};
    completedScores.forEach((s) => {
      scoreMap[String(s._id)] = s.totalPoints;
    });

    const activeMap = {};
    activeParticipations.forEach((a) => {
      activeMap[String(a._id)] = a.joinedCount;
    });

    // 3. Map calculated points & joined count
    const leaderboard = users.map((user) => {
      const uId = String(user._id);
      const actualPoints = scoreMap[uId] || 0;
      const joinedCount = activeMap[uId] || 0;

      return {
        ...user,
        ecoPoints: actualPoints,
        points: actualPoints,
        joinedCount: joinedCount,
      };
    });

    // 4. Sort: Highest points first -> Most joined challenges second
    leaderboard.sort((a, b) => {
      if (b.ecoPoints !== a.ecoPoints) {
        return b.ecoPoints - a.ecoPoints;
      }
      return b.joinedCount - a.joinedCount;
    });

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;