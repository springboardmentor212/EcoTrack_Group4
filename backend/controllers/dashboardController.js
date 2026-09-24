const Activity = require("../models/Activity");
const Goal = require("../models/Goal");
const mongoose = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1. Calculate Total Carbon Output Emissions
    const totalEmissionsResult = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$carbonOutput" } } },
    ]);
    const totalEmissions = totalEmissionsResult[0]?.total || 0;

    // 2. Synced Dynamic Eco Score Formula 
    const ecoScore = Math.max(10, Math.min(100, Math.round(100 - (totalEmissions * 0.35))));

    // 3. Category Breakdown Aggregation
    const categoryBreakdown = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          totalEmission: { $sum: "$carbonOutput" },
        },
      },
    ]);

    const categories = categoryBreakdown.map((cat) => ({
      name: cat._id || "General",
      emission: Number(cat.totalEmission.toFixed(1)),
      percentage: totalEmissions > 0 ? Math.round((cat.totalEmission / totalEmissions) * 100) : 0,
    }));

    // 4. In Progress Goals & Recent Activities
    const goals = await Goal.find({ userId, isCompleted: false }).limit(4);
    const recentActivities = await Activity.find({ userId }).sort({ activityDate: -1, createdAt: -1 }).limit(5);

    const recommendations = [
      { title: "Try biking to work on Tuesdays", subtitle: "Potential saving: 0.8 tons CO₂e", icon: "transport" },
      { title: "Optimize home heating schedule", subtitle: "Potential saving: 0.5 tons CO₂e", icon: "energy" },
    ];

    res.status(200).json({
      carbonFootprint: {
        ecoScore,
        totalEmissionsKg: Number(totalEmissions.toFixed(1)),
        totalEmissionsTons: (totalEmissions / 1000).toFixed(2),
        categories,
      },
      goalProgress: goals,
      recentActivity: recentActivities,
      aiRecommendations: recommendations,
    });
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
};