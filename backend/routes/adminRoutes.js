const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const Tracker = require("../models/Tracker");
const ChallengeParticipation = require("../models/ChallengeParticipation");

// HARDCODED ADMIN CREDENTIALS
const ADMIN_EMAIL = "admin@ecotrack.com";
const ADMIN_PASSWORD = "adminpassword123";

// Helper function to check matching User ID safely across String and ObjectId formats
const isSameUser = (id1, id2) => {
  if (!id1 || !id2) return false;
  return String(id1) === String(id2);
};

const isGoalCompleted = (g) => {
  if (!g) return false;
  return (
    g.isCompleted === true ||
    g.isCompleted === "true" ||
    (g.status && String(g.status).toLowerCase() === "completed") ||
    (g.targetValue && g.currentValue && Number(g.currentValue) >= Number(g.targetValue))
  );
};

// 1. Admin Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json({
        success: true,
        token: "admin-secret-jwt-token-2026",
        admin: {
          name: "System Admin",
          email: ADMIN_EMAIL,
          role: "ADMIN",
        },
        message: "Admin Login Successful!",
      });
    }

    return res.status(401).json({ message: "Invalid Admin Email or Password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Admin Get Enrolled Users & Stats (100% Synced Goals Count)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    const goals = await Goal.find({});

    const totalEnrolled = users.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = users.filter(
      (u) => new Date(u.createdAt || Date.now()) >= startOfMonth
    ).length;

    // Standardized Completed Goals Sum across all users
    const completedGoals = goals.filter(isGoalCompleted).length;

    const formattedUsers = users.map((u) => ({
      id: u._id,
      name: u.fullName || u.name || (u.email ? u.email.split("@")[0] : "User"),
      email: u.email,
      joinedDate: new Date(u.createdAt || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));

    res.status(200).json({
      success: true,
      totalEnrolled,
      newThisMonth,
      completedGoals,
      users: formattedUsers,
    });
  } catch (err) {
    console.error("Error fetching admin users:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Admin Get Challenges List
router.get("/challenges", async (req, res) => {
  try {
    const challenges = await Challenge.find({}).sort({ isWeekly: -1, levelRequired: 1 });
    res.status(200).json({ success: true, challenges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Admin Create Weekly Challenge
router.post("/challenges", async (req, res) => {
  try {
    const { title, category, targetGoal, targetUnit, points, badgeName, description } = req.body;
    const challengeId = `ch_weekly_${Date.now().toString().slice(-6)}`;

    const newChallenge = new Challenge({
      challengeId,
      title,
      tag: category || "General",
      description: description || `Complete ${title} weekly goal to earn eco rewards!`,
      rewardPoints: Number(points) || 100,
      rewardXP: 0, // Rule: Weekly drives give 0 XP
      targetGoal: Number(targetGoal) || 5,
      unit: targetUnit || "Times",
      badgeName: badgeName || `${title} Badge`,
      iconName: "Zap",
      levelRequired: 1,
      isWeekly: true,
    });

    await newChallenge.save();
    res.status(201).json({ success: true, challenge: newChallenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Admin Edit Challenge API
router.put("/challenges/:id", async (req, res) => {
  try {
    const challengeDbId = req.params.id;
    const { title, tag, targetGoal, unit, rewardPoints, rewardXP, badgeName, description } = req.body;

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
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, challenge: updatedChallenge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Admin Get Comprehensive Reports & Analytics (100% Synced)
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
    let totalStreakDays = 0;

    const levelChallengesList = challenges.filter((c) => !c.isWeekly);

    const userActivityList = users.map((u) => {
      const userIdStr = String(u._id);

      // Calculate CO2 and Activity Log Sync
      const userLogs = trackers.filter((t) => isSameUser(t.userId, userIdStr));
      let userSavedCO2 = 0;
      let latestActivityDate = u.createdAt || Date.now();

      userLogs.forEach((log) => {
        const saved = Number(log.carbonSaved || log.co2 || 0);
        userSavedCO2 += saved;

        const logDate = new Date(log.activityDate || log.createdAt || log.date);
        if (logDate > new Date(latestActivityDate)) {
          latestActivityDate = logDate;
        }
      });

      grandTotalSaved += userSavedCO2;

      // Exact Goal Match with Standardized Completion Logic
      const userGoals = goals.filter((g) => isSameUser(g.userId, userIdStr));
      const totalUserGoalsCount = userGoals.length;

      const completedUserGoalsCount = userGoals.filter(isGoalCompleted).length;
      totalCompletedGoalsCount += completedUserGoalsCount;

      let userGoalStatus = "In Progress";
      if (totalUserGoalsCount > 0 && completedUserGoalsCount === totalUserGoalsCount) {
        userGoalStatus = "Completed";
      }

      const uniqueDates = new Set(
        userLogs.map((l) => new Date(l.activityDate || l.createdAt).toDateString())
      );
      const userStreak = uniqueDates.size || 1;
      totalStreakDays += userStreak;

      const userParts = participations.filter((p) => isSameUser(p.userId, userIdStr));

      return {
        id: u._id,
        name: u.fullName || u.name || (u.email ? u.email.split("@")[0] : "User"),
        email: u.email,
        co2Reduced: Number(userSavedCO2.toFixed(1)),
        activeStreak: userStreak,
        goalStatus: userGoalStatus,
        completedGoalsCount: completedUserGoalsCount,
        totalGoalsCount: totalUserGoalsCount,
        lastActivity: new Date(latestActivityDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        level: u.level || 1,
        ecoPoints: u.ecoPoints || 0,
        xp: u.xp || 0,
        badgesEarned: userParts.filter(
          (p) => p.status === "CLAIMED" || p.status === "COMPLETED"
        ).length,
        challengesJoined: userParts.length,
        challengesCompleted: userParts.filter(
          (p) => p.status === "COMPLETED" || p.status === "CLAIMED"
        ).length,
        activeChallenges: userParts.filter((p) => p.status === "JOINED").length,
        userParts,
      };
    });

    const challengeDetails = challenges.map((ch) => {
      const chParts = participations.filter(
        (p) => isSameUser(p.challengeId, ch.challengeId) || isSameUser(p.challengeId, ch._id)
      );
      const totalParts = chParts.length;
      const completedParts = chParts.filter(
        (p) => p.status === "COMPLETED" || p.status === "CLAIMED"
      ).length;

      return {
        id: ch.challengeId || String(ch._id),
        level: ch.isWeekly ? "Weekly" : ch.levelRequired || 1,
        isWeekly: Boolean(ch.isWeekly),
        title: ch.title,
        category: ch.tag || "General",
        totalParticipants: totalParts,
        activeParticipants: chParts.filter((p) => p.status === "JOINED").length,
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

        const userLvlParts = userItem.userParts.filter((p) =>
          lvlChIds.includes(String(p.challengeId))
        );
        const completed = userLvlParts.filter(
          (p) => p.status === "COMPLETED" || p.status === "CLAIMED"
        ).length;

        userLevelWiseSummary.push({
          userName: userItem.name,
          userEmail: userItem.email,
          level: lvl,
          totalInLevel: totalLvlChsCount,
          joined: userLvlParts.length,
          completed,
          completionRate: `${((completed / totalLvlChsCount) * 100).toFixed(1)}%`,
        });
      });
    });

    const totalGoalsInSystem = goals.length || 1;
    const allCompletedGoalsCount = goals.filter(isGoalCompleted).length;
    const goalsCompletedPercent = Math.round(
      (allCompletedGoalsCount / totalGoalsInSystem) * 100
    );

    res.status(200).json({
      success: true,
      stats: {
        totalCO2Reduced: Number(grandTotalSaved.toFixed(1)),
        treesSavedEq: Math.round(grandTotalSaved / 21.7),
        goalsCompletedPercent: `${goalsCompletedPercent}%`,
        avgActiveStreak: `${
          users.length > 0 ? Math.round(totalStreakDays / users.length) : 0
        } days`,
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