const Tracker = require("../models/Tracker");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");
const Gamification = require("../models/Gamification");
const Recommendation = require("../models/Recommendation");
const mongoose = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.googleId;

    if (!userId) {
      return res.status(401).json({ message: "User ID missing" });
    }

    const userIdStr = String(userId);
    const userQuery = [
      { userId: userId },
      { userId: userIdStr },
      { user: userId },
      { user: userIdStr }
    ];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(userId) });
      userQuery.push({ user: new mongoose.Types.ObjectId(userId) });
    }

    // 1. RECENT ACTIVITIES & ECO SCORE
    const activities = await Tracker.find({ $or: userQuery })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    let totalCO2Reduced = 0;
    let totalEmissions = 0;

    activities.forEach((activity) => {
      const saved = Number(activity.carbonSaved || 0);
      const output = Number(activity.carbonOutput || activity.co2 || 0);
      const mode = activity.activityMode || (saved > 0 ? "saving" : "emission");

      if (mode === "saving") {
        totalCO2Reduced += saved > 0 ? saved : output;
      } else {
        totalEmissions += output;
      }
    });

    const netFootprint = Math.max(0, totalEmissions - totalCO2Reduced);
    let calculatedEcoScore = Math.round(100 - netFootprint * 0.1);
    const ecoScore = Math.max(10, Math.min(100, calculatedEcoScore));

    const categoryMap = {};
    activities.forEach((activity) => {
      const output = Number(activity.carbonOutput || activity.co2 || activity.carbonSaved || 0);
      const category = activity.category || "General";
      if (output > 0) {
        categoryMap[category] = (categoryMap[category] || 0) + output;
      }
    });

    const totalCatValue = Object.values(categoryMap).reduce((a, b) => a + b, 0);
    const categories = Object.entries(categoryMap).map(([name, emission]) => ({
      name,
      emission: Number(emission.toFixed(1)),
      percentage: totalCatValue > 0 ? Math.round((emission / totalCatValue) * 100) : 0,
    }));

  
    const completedGoals = await Goal.find({ 
      $or: userQuery, 
      $or: [{ isCompleted: true }, { status: "Completed" }, { progressPercentage: { $gte: 100 } }]
    }).sort({ updatedAt: -1 }).limit(1).lean();

    const activeGoals = await Goal.find({ 
      $or: userQuery,$and: [
        { isCompleted: { $ne: true } },
        { status: { $ne: "Completed" } },
        { progressPercentage: { $lt: 100 } }
      ]
    }).sort({ createdAt: -1 }).limit(2).lean();

    const dashboardGoals = [...completedGoals, ...activeGoals];

    
    const allChallenges = await Challenge.find({}).limit(10).lean();
    
    const userJoinedList = await UserChallenge.find({ $or: userQuery }).lean();

    const joinedSet = new Set();
    const joinedDataMap = {};

    userJoinedList.forEach(uc => {
      const chId = String(uc.challenge || uc.challengeId || "");
      if (chId) {
        joinedSet.add(chId);
        joinedDataMap[chId] = uc;
      }
    });

    const challengesList = allChallenges.map((ch) => {
      const chId = String(ch._id);
      const isJoined = joinedSet.has(chId);
      const ucData = joinedDataMap[chId];

      return {
        _id: ch._id,
        title: ch.title,
        description: ch.description || ch.subtitle || "Community Challenge",
        isJoined: isJoined,
        status: isJoined ? (ucData?.status || "Active") : "Available",
        progress: isJoined ? (ucData?.progress || 0) : 0,
        target: ch.target || 100,
        icon: ch.icon || "flag"
      };
    }).slice(0, 3);

    
    let gamification = await Gamification.findOne({ $or: userQuery }).lean();

    const totalXP = Math.round(totalCO2Reduced * 10);
    
    const calculatedLevel = Math.min(10, Math.max(1, Math.floor(totalXP / 1000) + 1));

    if (!gamification) {
      
      const dynamicBadges = [];
      if (totalCO2Reduced > 0) dynamicBadges.push({ id: 1, name: "Eco Warrior", symbol: "🌿", color: "green" });
      if (activities.some(a => a.category?.toLowerCase() === "energy")) dynamicBadges.push({ id: 2, name: "Energy Saver", symbol: "⚡", color: "amber" });
      if (activities.some(a => a.category?.toLowerCase() === "transport")) dynamicBadges.push({ id: 3, name: "Green Traveler", symbol: "🚲", color: "emerald" });

      gamification = {
        levelName: `Level ${calculatedLevel}: Green Pioneer`,
        currentXP: totalXP % 1000,
        nextLevelXP: 1000,
        earnedBadges: dynamicBadges
      };
    } else {
      gamification.levelName = `Level ${calculatedLevel}: Green Pioneer`;
      gamification.currentXP = totalXP % 1000;
      gamification.nextLevelXP = 1000;
    }

    // 5. RECOMMENDATIONS
    let recommendations = await Recommendation.find({ $or: userQuery }).limit(4).lean();

    if (!recommendations || recommendations.length < 4) {
      recommendations = [
        { title: "Try biking to work on Tuesdays", subtitle: "Potential saving: 0.8 kg CO₂e", icon: "transport" },
        { title: "Optimize home heating schedule", subtitle: "Potential saving: 0.5 kg CO₂e", icon: "energy" },
        { title: "Switch to LED lights in living areas", subtitle: "Potential saving: 0.3 kg CO₂e", icon: "bolt" },
        { title: "Reduce single-use plastic waste", subtitle: "Potential saving: 0.4 kg CO₂e", icon: "leaf" }
      ];
    }

    return res.status(200).json({
      carbonFootprint: {
        ecoScore,
        totalEmissionsKg: Number(totalEmissions.toFixed(1)),
        totalEmissionsTons: (totalEmissions / 1000).toFixed(2),
        totalCO2Reduced: Number(totalCO2Reduced.toFixed(1)),
        netFootprint: Number(netFootprint.toFixed(1)),
        categories,
      },
      goalProgress: dashboardGoals,
      recentActivity: activities.slice(0, 3),
      joinedChallenges: challengesList,
      gamification,
      aiRecommendations: recommendations.slice(0, 4),
    });
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    return res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};