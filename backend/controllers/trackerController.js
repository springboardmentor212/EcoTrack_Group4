const Tracker = require("../models/Tracker");
const Goal = require("../models/Goal");
const mongoose = require("mongoose");

// Gamification Models Loading
const Participation = require("../models/Participation");
const User = require("../models/User");

let Notification;
try {
  Notification = require("../models/Notification");
} catch (e) {
  console.log("Notification model load failed fallback");
}

const getUserId = (req) => {
  return (
    req.user?.id || 
    req.user?._id || 
    req.user?.googleId || 
    req.user?.email || 
    "guest"
  );
};

// Category and Activity Normalization
const normalizeCategory = (cat, activityType) => {
  const combined = `${cat || ""} ${activityType || ""}`.toLowerCase().trim();

  if (
    combined.includes("transport") ||
    combined.includes("walk") ||
    combined.includes("cycle") ||
    combined.includes("bus") ||
    combined.includes("train") ||
    combined.includes("commute")
  ) {
    return "transport";
  }
  if (
    combined.includes("energy") ||
    combined.includes("electric") ||
    combined.includes("bulb") ||
    combined.includes("power")
  ) {
    return "energy";
  }
  if (combined.includes("food") || combined.includes("diet")) return "food";
  if (combined.includes("waste") || combined.includes("plastic")) return "waste";
  if (combined.includes("water")) return "water";

  return "overall";
};

// Helper 1: Check Goals & Trigger Notifications
const checkGoalsAndNotify = async (currentUserId) => {
  try {
    const userQuery = [
      { userId: currentUserId },
      { userId: String(currentUserId) },
      { userId: "guest" }
    ];

    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const activeGoals = await Goal.find({
      $or: userQuery,
      $or: [{ isCompleted: false }, { isCompleted: {$exists: false } }]
    });

    if (!activeGoals || activeGoals.length === 0) return;

    const allTrackers = await Tracker.find({ $or: userQuery }).lean();

    for (const g of activeGoals) {
      const goalCatKey = normalizeCategory(g.category, g.title);

      let goalCreatedTime = 0;
      if (g.createdAt) {
        goalCreatedTime = new Date(g.createdAt).getTime();
      } else if (g._id && typeof g._id.getTimestamp === "function") {
        goalCreatedTime = g._id.getTimestamp().getTime();
      }

      let totalSaved = 0;
      let totalEmitted = 0;

      allTrackers.forEach((t) => {
        const trackerCatKey = normalizeCategory(
          t.category,
          t.subType || t.activityType || t.title
        );

        const categoryMatches =
          goalCatKey === "overall" || trackerCatKey === goalCatKey;

        let trackerTime = 0;
        if (t.createdAt) {
          trackerTime = new Date(t.createdAt).getTime();
        } else if (t.activityDate) {
          trackerTime = new Date(t.activityDate).getTime();
        } else if (t.date) {
          trackerTime = new Date(t.date).getTime();
        }

        if (categoryMatches && trackerTime >= (goalCreatedTime - 5000)) {
          totalSaved += Number(t.carbonSaved || 0);
          totalEmitted += Number(t.carbonOutput || 0);
        }
      });

      const netProgress = totalSaved - totalEmitted;
      const targetVal = Number(g.targetValue) || 1;

      if (netProgress >= targetVal) {
        g.isCompleted = true;
        g.completedAt = new Date();
        await g.save();

        console.log(`🎉 GOAL ACHIEVED TRIGGERED: ${g.title}`);

        if (Notification) {
          await Notification.create({
            userId: String(currentUserId),
            title: "🎉 Goal Achieved!",
            message: `Congratulations! You successfully completed your goal: "${g.title}" by saving ${netProgress.toFixed(1)} kg CO2e!`,
            type: "goal_completed",
            isRead: false,
            createdAt: new Date()
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in checkGoalsAndNotify:", err);
  }
};

const checkChallengesAndUpdateRewards = async (currentUserId, rawCategory, activityValue) => {
  let completedRewards = [];

  try {
    const normCat = normalizeCategory(rawCategory, "");

    const activeParticipations = await Participation.find({
      userId: String(currentUserId),
      status: "JOINED"
    }).populate("challengeId");

    for (let p of activeParticipations) {
      if (!p.challengeId) continue;

      const challengeCat = normalizeCategory(p.challengeId.category, p.challengeId.title);

      if (challengeCat === normCat || challengeCat === "overall") {
        p.progress += Number(activityValue) || 1;

        if (p.progress >= p.challengeId.targetGoal) {
          p.progress = p.challengeId.targetGoal;
          p.status = "COMPLETED";
          p.completedAt = new Date();

          // User Accounts Updates (Points & XP)
          let user = null;
          if (mongoose.Types.ObjectId.isValid(currentUserId)) {
            user = await User.findById(currentUserId);
          } else {
            user = await User.findOne({ $or: [{ googleId: currentUserId }, { email: currentUserId }] });
          }

          if (user) {
            user.ecoPoints = (user.ecoPoints || 0) + (p.challengeId.rewardPoints || 0);
            user.xp = (user.xp || 0) + (p.challengeId.rewardXP || 0);
            user.level = Math.floor(user.xp / 500) + 1; // Level Up Calculation
            await user.save();

            completedRewards.push({
              title: p.challengeId.title,
              rewardPoints: p.challengeId.rewardPoints,
              rewardXP: p.challengeId.rewardXP,
              badgeName: p.challengeId.badgeName || "Eco Warrior",
              badgeIcon: p.challengeId.badgeIcon || "🚲",
              newEcoPoints: user.ecoPoints,
              newXP: user.xp,
              newLevel: user.level
            });

            // Challenge Completion Notification
            if (Notification) {
              await Notification.create({
                userId: String(currentUserId),
                title: "🏆 Challenge Completed!",
                message: `You completed "${p.challengeId.title}" and earned 🪙 +${p.challengeId.rewardPoints} Eco Points!`,
                type: "challenge_completed",
                isRead: false,
                createdAt: new Date()
              });
            }
          }
        }
        await p.save();
      }
    }
  } catch (err) {
    console.error("Error in checkChallengesAndUpdateRewards:", err);
  }

  return completedRewards;
};

// 1. Log Activity (Emissions & Savings + Challenge Auto Sync)
exports.logActivity = async (req, res) => {
  try {
    const { 
      category, 
      activityType, 
      subType, 
      value, 
      passengers,
      activityMode,
      carbonOutput, 
      carbonSaved,
      co2, 
      activityDate, 
      date 
    } = req.body;

    const currentUserId = getUserId(req);
    const mode = activityMode === "saving" ? "saving" : "emission";
    
    const outputVal = mode === "emission" ? (Number(carbonOutput !== undefined ? carbonOutput : co2) || 0) : 0;
    const savedVal = mode === "saving" ? (Number(carbonSaved !== undefined ? carbonSaved : co2) || 0) : 0;
    const usageValue = Number(value) || 0;
    const cleanCategory = category || "General";

    const rawDate = date || activityDate || new Date();
    const dateObj = new Date(rawDate);
    const dateStr = dateObj.toISOString().split("T")[0];

    const newLog = new Tracker({
      userId: currentUserId,
      category: cleanCategory,
      subType: subType || activityType || "",
      activityMode: mode,
      value: usageValue,
      passengers: Number(passengers) || 1,
      carbonOutput: outputVal,
      carbonSaved: savedVal,
      co2: mode === "saving" ? savedVal : outputVal,
      date: dateStr,
      activityDate: dateObj,
      createdAt: new Date()
    });

    await newLog.save();

    console.log("=================================");
    console.log("NEW TRACKER ACTIVITY LOGGED");
    console.log("User:", currentUserId);
    console.log("Mode:", mode);
    console.log("Output:", outputVal, "| Saved:", savedVal);
    console.log("Date:", dateStr);
    console.log("=================================");

    // 1. AUTOMATICALLY CHECK GOALS & CREATE NOTIFICATION
    await checkGoalsAndNotify(currentUserId);

    // 2. AUTOMATICALLY CHECK CHALLENGES & UNLOCK REWARDS
    const rewardsUnlocked = await checkChallengesAndUpdateRewards(
      currentUserId,
      cleanCategory,
      usageValue
    );

    return res.status(201).json({ 
      message: "Activity logged successfully", 
      data: newLog,
      triggerModal: rewardsUnlocked.length > 0,
      rewardsUnlocked: rewardsUnlocked
    });
  } catch (error) {
    console.error("Error in logActivity:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Get History
exports.getHistory = async (req, res) => {
  try {
    const currentUserId = getUserId(req);

    const userQuery = [
      { userId: currentUserId },
      { userId: String(currentUserId) },
      { userId: "guest" }
    ];

    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const history = await Tracker.find({ $or: userQuery })
      .sort({ createdAt: -1 })
      .lean();

    const formattedHistory = (history || []).map((item) => ({
      _id: item._id,
      category: item.category,
      activityType: item.subType || item.category,
      activityMode: item.activityMode || (item.carbonSaved > 0 ? "saving" : "emission"),
      value: item.value,
      passengers: item.passengers || 1,
      carbonOutput: Number(item.carbonOutput || (item.activityMode === "saving" ? 0 : item.co2) || 0),
      carbonSaved: Number(item.carbonSaved || (item.activityMode === "saving" ? item.co2 : 0) || 0),
      activityDate: item.activityDate || item.date || item.createdAt,
    }));

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error in getHistory:", error);
    return res.status(200).json([]);
  }
};

// 3. Get Summary
exports.getSummary = async (req, res) => {
  try {
    const currentUserId = getUserId(req);

    const userQuery = [
      { userId: currentUserId },
      { userId: String(currentUserId) },
      { userId: "guest" }
    ];

    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const history = await Tracker.find({ $or: userQuery }).lean();

    let totalEmissions = 0;
    let totalSaved = 0;

    const categoryBreakdown = {
      Transport: { emitted: 0, saved: 0 },
      Energy: { emitted: 0, saved: 0 },
      Food: { emitted: 0, saved: 0 },
      Waste: { emitted: 0, saved: 0 },
      Water: { emitted: 0, saved: 0 }
    };

    (history || []).forEach((item) => {
      const mode = item.activityMode || (item.carbonSaved > 0 ? "saving" : "emission");
      const emittedVal = mode === "emission" ? Number(item.carbonOutput || item.co2 || 0) : 0;
      const savedVal = mode === "saving" ? Number(item.carbonSaved || item.co2 || 0) : 0;

      totalEmissions += emittedVal;
      totalSaved += savedVal;

      if (categoryBreakdown[item.category]) {
        categoryBreakdown[item.category].emitted += emittedVal;
        categoryBreakdown[item.category].saved += savedVal;
      }
    });

    const netFootprint = Math.max(0, totalEmissions - totalSaved);

    return res.status(200).json({
      totalEmissions: Number(totalEmissions.toFixed(2)),
      totalSaved: Number(totalSaved.toFixed(2)),
      netFootprint: Number(netFootprint.toFixed(2)),
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    return res.status(200).json({
      totalEmissions: 0,
      totalSaved: 0,
      netFootprint: 0,
      categoryBreakdown: {
        Transport: { emitted: 0, saved: 0 },
        Energy: { emitted: 0, saved: 0 },
        Food: { emitted: 0, saved: 0 },
        Waste: { emitted: 0, saved: 0 },
        Water: { emitted: 0, saved: 0 }
      },
    });
  }
};