const Activity = require("../models/Activity");
const Goal = require("../models/Goal");
const mongoose = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalEmissionsResult = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$carbonOutput" } } },
    ]);
    const totalEmissions = totalEmissionsResult[0]?.total || 0;

    const ecoScore = Math.max(0, Math.min(100, Math.round(100 - totalEmissions / 10)));

    const goals = await Goal.find({ userId, status: "in progress" }).limit(4);
    const recentActivities = await Activity.find({ userId }).sort({ activityDate: -1 }).limit(5);

    const recommendations = [
      { text: "Try biking to work on Tuesdays", potentialSaving: "0.2 tons CO2e" },
      { text: "Optimize home heating schedule", potentialSaving: "0.3 tons CO2e" },
    ];

    res.json({
      carbonFootprint: {
        ecoScore,
        totalEmissions: `${(totalEmissions / 1000).toFixed(1)} tons CO2e`,
      },
      goalProgress: goals,
      recentActivity: recentActivities,
      aiRecommendations: recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};