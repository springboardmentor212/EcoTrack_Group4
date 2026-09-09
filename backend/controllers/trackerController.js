const Activity = require("../models/Activity");
const mongoose = require("mongoose");

const calculateEmission = (category, type, value, passengers = 1) => {
  let factor = 0.192;
  if (category === "Transport") factor = 0.192;
  if (category === "Energy") factor = 0.385;
  if (category === "Food") factor = 0.5;
  if (category === "Water Usage") factor = 0.003;
  if (category === "Waste") factor = 0.2;

  return parseFloat(((value * factor) / passengers).toFixed(2));
};

exports.logActivity = async (req, res) => {
  try {
    const { category, activityType, value, passengers, activityDate } = req.body;
    const userId = req.user.id;

    const carbonOutput = calculateEmission(category, activityType, value, passengers);

    const newActivity = await Activity.create({
      userId,
      category,
      activityType,
      value,
      passengers: passengers || 1,
      carbonOutput,
      activityDate: activityDate || new Date(),
    });

    res.status(201).json({ message: "Activity logged successfully", activity: newActivity });
  } catch (error) {
    res.status(500).json({ message: "Error logging activity", error: error.message });
  }
};

exports.getHistoricalActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await Activity.find({ userId }).sort({ activityDate: -1 }).limit(10);

    const categoryTotals = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", totalOutput: { $sum: "$carbonOutput" } } },
    ]);

    res.json({ activities, categoryTotals });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
};