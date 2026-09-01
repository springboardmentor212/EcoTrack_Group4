const mongoose = require("mongoose");
const CarbonEntry = require("../models/CarbonEntry");
const Goal = require("../models/Goal");
const User = require("../models/User");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from Auth Middleware

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const goals = await Goal.find({ userId });
    const recentActivities = await CarbonEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Aggregate total carbon footprint (Converted userId to ObjectId)
    const totalEmissions = await CarbonEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$carbonEmitted" } } },
    ]);

    res.json({
      user,
      totalCarbonEmissions: totalEmissions[0]?.total || 0,
      goals,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};