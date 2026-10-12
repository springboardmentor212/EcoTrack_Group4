const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const Tracker = require("../models/Tracker");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const authMiddleware = require("../middleware/authMiddleware");

// HARDCODED ADMIN CREDENTIALS
const ADMIN_EMAIL = "admin@ecotrack.com";
const ADMIN_PASSWORD = "adminpassword123";

// Level Mapping Configuration (1 to 10 Levels)
const LEVEL_CONFIG = [
  { level: 1, title: "Eco Starter", icon: "🌱", nextTitle: "Eco Learner" },
  { level: 2, title: "Eco Learner", icon: "🌿", nextTitle: "Green Helper" },
  { level: 3, title: "Green Helper", icon: "🍃", nextTitle: "Waste Reducer" },
  { level: 4, title: "Waste Reducer", icon: "♻️", nextTitle: "Eco Defender" },
  { level: 5, title: "Eco Defender", icon: "🛡️", nextTitle: "Energy Saver" },
  { level: 6, title: "Energy Saver", icon: "⚡", nextTitle: "Tree Planter" },
  { level: 7, title: "Tree Planter", icon: "🌲", nextTitle: "Climate Warrior" },
  { level: 8, title: "Climate Warrior", icon: "🌍", nextTitle: "Eco Guardian" },
  { level: 9, title: "Eco Guardian", icon: "👑", nextTitle: "Planet Savior" },
  { level: 10, title: "Planet Savior", icon: "🌌", nextTitle: "Pinnacle Reached" },
];

const normalizeCategory = (tag, title) => {
  const text = `${tag || ""} ${title || ""}`.toLowerCase();
  if (text.includes("transport") || text.includes("bike") || text.includes("walk") || text.includes("commute") || text.includes("travel")) return "transport";
  if (text.includes("energy") || text.includes("light") || text.includes("charger") || text.includes("solar") || text.includes("power") || text.includes("electricity")) return "energy";
  if (text.includes("food") || text.includes("diet") || text.includes("meal") || text.includes("compost")) return "food";
  if (text.includes("waste") || text.includes("plastic") || text.includes("bag") || text.includes("recycle") || text.includes("recycling")) return "waste";
  if (text.includes("water") || text.includes("tap") || text.includes("shower") || text.includes("conservation")) return "water";
  if (text.includes("plant") || text.includes("tree") || text.includes("garden") || text.includes("greenery")) return "nature";
  return "overall";
};

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

    const now = new Date();

    for (let participation of userJoined) {
      const challenge = await Challenge.findOne({
        challengeId: participation.challengeId,
      }).lean();

      if (!challenge) continue;

      if (challenge.isWeekly && challenge.endDate && new Date(challenge.endDate) < now) {
        continue;
      }

      const challengeCategory = normalizeCategory(challenge.tag || challenge.category, challenge.title);
      const targetGoal = Number(challenge.targetGoal || 1);
      const joinedDate = participation.createdAt ? new Date(participation.createdAt).getTime() : 0;

      let matchedLogsCount = 0;

      userLogs.forEach((log) => {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : log.activityDate ? new Date(log.activityDate).getTime() : 0;
        if (joinedDate > 0 && logTime < joinedDate - 5000) return;

        const logCategory = normalizeCategory(log.category || log.activityType, log.subType);
        const mode = log.activityMode || (Number(log.carbonSaved) > 0 ? "saving" : "emission");

        if (mode !== "saving") return;

        if (challengeCategory === "overall" || logCategory === challengeCategory) {
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

  const realTotalEcoPoints = validChallenges.reduce(
    (sum, c) => sum + Number(c.rewardPoints || 0),
    0
  );

  const realTotalXP = validChallenges.reduce((sum, c) => {
    const isWeekly = c.isWeekly === true || c.isWeekly === "true";
    return isWeekly ? sum : sum + Number(c.rewardXP || 0);
  }, 0);

  user.ecoPoints = realTotalEcoPoints;
  user.xp = realTotalXP;
  await user.save();

  let currentLevel = Number(user.level || 1);

  let currentLevelDbChallenges = await Challenge.find({
    $and: [
      { $or: [{ levelRequired: currentLevel }, { levelRequired: String(currentLevel) }] },
      { $or: [{ isWeekly: false }, { isWeekly: "false" }, { isWeekly: { $exists: false } }, { isWeekly: null }] }
    ]
  }).lean();

  const currentLevelIds = currentLevelDbChallenges.map((c) => c.challengeId);

  const completedInCurrentLevel = await ChallengeParticipation.countDocuments({
    userId: String(userId),
    challengeId: { $in: currentLevelIds },
    status: { $in: ["COMPLETED", "CLAIMED"] },
  });

  const totalRequiredInLevel = currentLevelDbChallenges.length || 1;

  if (completedInCurrentLevel >= totalRequiredInLevel && currentLevel < 10 && currentLevelDbChallenges.length > 0) {
    currentLevel += 1;
    user.level = currentLevel;
    await user.save();
    return evaluateUserLevelProgress(userId);
  }

  const currentConfig = LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];
  const levelProgressPercent = Math.min(100, Math.round((completedInCurrentLevel / totalRequiredInLevel) * 100));

  return {
    userLevelDetails: {
      level: currentConfig.level,
      title: currentConfig.title,
      icon: currentConfig.icon,
      currentXP: realTotalXP,
      levelMaxXP: currentLevel * 500,
      completedInLevel: completedInCurrentLevel,
      totalInLevel: totalRequiredInLevel,
      progressPercent: levelProgressPercent,
      nextLevelTitle: currentConfig.nextTitle,
    },
    user: {
      ...user.toObject(),
      ecoPoints: realTotalEcoPoints,
      xp: realTotalXP,
    },
  };
}

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        token: "admin-secret-jwt-token-2026",
        admin: { name: "System Admin", email: ADMIN_EMAIL, role: "ADMIN" },
        message: "Admin Login Successful!",
      });
    }
    return res.status(401).json({ message: "Invalid Admin Email or Password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Get Challenges
router.get("/challenges", async (req, res) => {
  try {
    const challenges = await Challenge.find({}).sort({ isWeekly: -1, levelRequired: 1 });
    res.status(200).json({ success: true, challenges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Create Weekly Drive
router.post("/challenges", async (req, res) => {
  try {
    const { title, category, targetGoal, targetUnit, points, badgeName, description, startDate, endDate } = req.body;
    const challengeId = `ch_weekly_${Date.now().toString().slice(-6)}`;

    const defaultStart = startDate ? new Date(startDate) : new Date();
    const defaultEnd = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newChallenge = new Challenge({
      challengeId,
      title,
      tag: category || "General",
      description: description || `Complete ${title} weekly goal to earn eco rewards!`,
      rewardPoints: Number(points) || 100,
      rewardXP: 0,
      targetGoal: Number(targetGoal) || 5,
      unit: targetUnit || "Times",
      badgeName: badgeName || `${title} Badge`,
      iconName: "Zap",
      levelRequired: 1,
      isWeekly: true,
      startDate: defaultStart,
      endDate: defaultEnd,
    });

    await newChallenge.save();
    res.status(201).json({ success: true, challenge: newChallenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Update Challenge
router.put("/challenges/:id", async (req, res) => {
  try {
    const challengeDbId = req.params.id;
    const { title, tag, targetGoal, unit, rewardPoints, rewardXP, badgeName, description, startDate, endDate } = req.body;

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeDbId,
      {
        $set: {
          title,
          tag,
          targetGoal: Number(targetGoal),
          unit,
          rewardPoints: Number(rewardPoints),
          rewardXP: Number(rewardXP),
          badgeName,
          description,
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, challenge: updatedChallenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/available", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { userLevelDetails, user } = await evaluateUserLevelProgress(userId);

    const currentUser = await User.findById(userId).lean();
    
    // Extract registration date accurately
    let userRegistrationDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : null;
    if (!userRegistrationDate && currentUser?._id) {
      userRegistrationDate = new Date(parseInt(String(currentUser._id).substring(0, 8), 16) * 1000);
    }
    if (!userRegistrationDate) userRegistrationDate = new Date(0);

    const currentLevel = Number(userLevelDetails.level || 1);
    const now = new Date();

    const accessibleChallenges = await Challenge.find({
      $or: [
        { levelRequired: currentLevel },
        { levelRequired: String(currentLevel) },
        { isWeekly: true },
        { isWeekly: "true" }
      ],
    })
      .sort({ isWeekly: -1, createdAt: -1 })
      .lean();

    // FILTER OUT DRIVES CREATED BEFORE USER REGISTERED OR EXPIRED ONES
    const activeAccessible = accessibleChallenges.filter((ch) => {
      const isWeekly = ch.isWeekly === true || ch.isWeekly === "true";
      if (isWeekly) {
        // Expiration check
        if (ch.endDate && new Date(ch.endDate) < now) return false;

        // Creation Date check
        let challengeCreatedDate = ch.createdAt ? new Date(ch.createdAt) : ch.startDate ? new Date(ch.startDate) : null;
        if (!challengeCreatedDate && ch._id) {
          challengeCreatedDate = new Date(parseInt(String(ch._id).substring(0, 8), 16) * 1000);
        }
        if (!challengeCreatedDate) challengeCreatedDate = new Date();

        
        const marginRegDate = new Date(userRegistrationDate.getTime() - 24 * 60 * 60 * 1000);
        if (challengeCreatedDate < marginRegDate) return false;
      }
      return true;
    });

    res.json({
      userLevelDetails,
      ecoPoints: user.ecoPoints || 0,
      xp: user.xp || 0,
      challenges: activeAccessible,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my-status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const participations = await ChallengeParticipation.find({ userId: String(userId) }).lean();
    res.json(participations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/counts", async (req, res) => {
  try {
    const counts = await ChallengeParticipation.aggregate([
      { $match: { status: { $in: ["JOINED", "COMPLETED", "CLAIMED"] } } },
      { $group: { _id: "$challengeId", count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { challengeId } = req.body;

    const target = await Challenge.findOne({ challengeId }).lean();
    if (target && target.isWeekly && target.endDate && new Date(target.endDate) < new Date()) {
      return res.status(400).json({ message: "This weekly drive has expired!" });
    }

    await ChallengeParticipation.updateOne(
      { userId: String(userId), challengeId },
      { $setOnInsert: { status: "JOINED", progress: 0, createdAt: new Date() } },
      { upsert: true }
    );

    const { userLevelDetails, user } = await evaluateUserLevelProgress(userId);

    res.json({
      success: true,
      message: "Successfully joined challenge!",
      ecoPoints: user.ecoPoints,
      xp: user.xp,
      userLevelDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/claim-reward", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { challengeId } = req.body;

    const target = await Challenge.findOne({ challengeId }).lean();
    if (target && target.isWeekly && target.endDate && new Date(target.endDate) < new Date()) {
      return res.status(400).json({ message: "This weekly drive has expired!" });
    }

    await ChallengeParticipation.updateOne(
      { userId: String(userId), challengeId },
      { $set: { status: "CLAIMED" } }
    );

    const { userLevelDetails, user } = await evaluateUserLevelProgress(userId);

    res.json({
      success: true,
      message: "Reward claimed successfully!",
      ecoPoints: user.ecoPoints,
      xp: user.xp,
      userLevelDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Reports Endpoint
router.get("/reports", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    const goals = await Goal.find({});
    const trackers = await Tracker.find({});
    const challenges = await Challenge.find({}).sort({ levelRequired: 1 });
    const participations = await ChallengeParticipation.find({}).lean();

    const totalSystemUsers = users.length || 1;
    let grandTotalSaved = 0;
    let totalCompletedGoalsCount = 0;
    let totalGoalsCount = goals.length;
    let totalStreakDays = 0;

    const levelChallengesList = challenges.filter((c) => !c.isWeekly);

    const userActivityList = users.map((u) => {
      const userIdStr = String(u._id);
      const userLogs = trackers.filter((t) => String(t.userId) === userIdStr);
      let userSavedCO2 = 0;
      let latestActivityDate = u.createdAt;

      userLogs.forEach((log) => {
        const saved = Number(log.carbonSaved || log.co2 || 0);
        userSavedCO2 += saved;
        const logDate = new Date(log.activityDate || log.createdAt || log.date);
        if (logDate > new Date(latestActivityDate)) latestActivityDate = logDate;
      });

      grandTotalSaved += userSavedCO2;

      const userGoals = goals.filter((g) => String(g.userId) === userIdStr);
      let userGoalStatus = "In Progress";

      if (userGoals.length > 0) {
        const completedUserGoals = userGoals.filter((g) => g.isCompleted || g.status === "Completed").length;
        totalCompletedGoalsCount += completedUserGoals;
        if (completedUserGoals === userGoals.length) userGoalStatus = "Completed";
      }

      const uniqueDates = new Set(userLogs.map((l) => new Date(l.activityDate || l.createdAt).toDateString()));
      const userStreak = uniqueDates.size || 1;
      totalStreakDays += userStreak;

      const userParts = participations.filter((p) => String(p.userId) === userIdStr);
      const joinedCount = userParts.length;
      const completedParts = userParts.filter((p) => p.status === "COMPLETED" || p.status === "CLAIMED").length;
      const activeParts = userParts.filter((p) => p.status === "JOINED").length;
      const claimedBadges = userParts.filter((p) => p.status === "CLAIMED" || p.status === "COMPLETED").length;

      return {
        id: u._id,
        name: u.fullName || u.email.split("@")[0],
        email: u.email,
        co2Reduced: Number(userSavedCO2.toFixed(1)),
        activeStreak: userStreak,
        goalStatus: userGoalStatus,
        lastActivity: new Date(latestActivityDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        level: u.level || 1,
        ecoPoints: u.ecoPoints || 0,
        xp: u.xp || 0,
        badgesEarned: claimedBadges,
        challengesJoined: joinedCount,
        challengesCompleted: completedParts,
        activeChallenges: activeParts,
        userParts,
      };
    });

    const challengeDetails = challenges.map((ch) => {
      const chParts = participations.filter((p) => String(p.challengeId) === String(ch.challengeId) || String(p.challengeId) === String(ch._id));
      const totalParts = chParts.length;
      const completedParts = chParts.filter((p) => p.status === "COMPLETED" || p.status === "CLAIMED").length;
      const activeParts = chParts.filter((p) => p.status === "JOINED").length;

      return {
        id: ch.challengeId || String(ch._id),
        level: ch.isWeekly ? "Weekly" : ch.levelRequired || 1,
        isWeekly: Boolean(ch.isWeekly),
        title: ch.title,
        category: ch.tag || "General",
        totalParticipants: totalParts,
        activeParticipants: activeParts,
        completedParticipants: completedParts,
        completionRate: `${((completedParts / totalSystemUsers) * 100).toFixed(1)}%`,
        rewardPoints: ch.rewardPoints || 50,
        rewardXP: ch.isWeekly ? 0 : ch.rewardXP || 50,
        badgeName: ch.badgeName || "Eco Warrior",
      };
    });

    const weeklyChallengeDetails = challengeDetails.filter((c) => c.isWeekly);
    const levelChallengeDetails = challengeDetails.filter((c) => !c.isWeekly);

    const userLevelWiseSummary = [];
    userActivityList.forEach((userItem) => {
      Array.from({ length: 10 }, (_, i) => i + 1).forEach((lvl) => {
        const lvlChs = levelChallengesList.filter((c) => Number(c.levelRequired) === lvl);
        const totalLvlChsCount = lvlChs.length || 1;
        const lvlChIds = lvlChs.map((c) => String(c.challengeId));

        const userLvlParts = userItem.userParts.filter((p) => lvlChIds.includes(String(p.challengeId)));
        const joined = userLvlParts.length;
        const completed = userLvlParts.filter((p) => p.status === "COMPLETED" || p.status === "CLAIMED").length;

        userLevelWiseSummary.push({
          userName: userItem.name,
          userEmail: userItem.email,
          level: lvl,
          totalInLevel: totalLvlChsCount,
          joined,
          completed,
          completionRate: `${((completed / totalLvlChsCount) * 100).toFixed(1)}%`,
        });
      });
    });

    const treesSaved = Math.round(grandTotalSaved / 21.7);
    const goalsCompletedPercent = totalGoalsCount > 0 ? Math.round((totalCompletedGoalsCount / totalGoalsCount) * 100) : 100;
    const avgStreak = users.length > 0 ? Math.round(totalStreakDays / users.length) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCO2Reduced: Number(grandTotalSaved.toFixed(1)),
        treesSavedEq: treesSaved,
        goalsCompletedPercent: `${goalsCompletedPercent}%`,
        avgActiveStreak: `${avgStreak} days`,
      },
      weeklyDrives: weeklyChallengeDetails,
      levelChallenges: levelChallengeDetails,
      reports: userActivityList,
      userLevelWiseSummary,
      leaderboard: [...userActivityList].sort((a, b) => b.ecoPoints - a.ecoPoints),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
