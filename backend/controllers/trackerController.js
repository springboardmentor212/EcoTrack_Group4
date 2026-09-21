const Tracker = require("../models/Tracker");
const mongoose = require("mongoose");

const getUserId = (req) => {
  return String(
    req.user?.id || 
    req.user?._id || 
    req.user?.googleId || 
    req.user?.email || 
    "guest"
  );
};

// 1. Log Activity
exports.logActivity = async (req, res) => {
  try {
    const { category, activityType, subType, value, carbonOutput, co2, activityDate, date } = req.body;
    const currentUserId = getUserId(req);

    const co2Value = Number(co2 !== undefined ? co2 : carbonOutput) || 0;
    const usageValue = Number(value) || 0;
    const cleanCategory = category || "General";

    const newLog = new Tracker({
      userId: currentUserId,
      category: cleanCategory,
      subType: subType || activityType || "",
      value: usageValue,
      co2: co2Value,
      date: date || activityDate || new Date().toISOString().split("T")[0],
    });

    await newLog.save();

    return res.status(201).json({ message: "Activity logged successfully", data: newLog });
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
      value: item.value,
      carbonOutput: item.co2 !== undefined ? item.co2 : item.carbonOutput || 0,
      activityDate: item.date || item.createdAt?.toISOString()?.split("T")[0],
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
      { userId: "guest" }
    ];

    if (mongoose.Types.ObjectId.isValid(currentUserId)) {
      userQuery.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
    }

    const history = await Tracker.find({ $or: userQuery }).lean();

    let totalCarbon = 0;
    let todayCarbon = 0;
    let monthCarbon = 0;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMonthStr = todayStr.substring(0, 7);

    const categoryBreakdown = { Transport: 0, Energy: 0, Food: 0, Waste: 0, Water: 0 };

    (history || []).forEach((item) => {
      const co2Val = Number(item.co2 !== undefined ? item.co2 : item.carbonOutput) || 0;
      totalCarbon += co2Val;

      let itemDateStr = "";
      if (item.date) {
        itemDateStr = String(item.date).split("T")[0];
      } else if (item.createdAt) {
        itemDateStr = new Date(item.createdAt).toISOString().split("T")[0];
      }

      if (itemDateStr === todayStr) todayCarbon += co2Val;
      if (itemDateStr && itemDateStr.startsWith(currentMonthStr)) monthCarbon += co2Val;

      if (categoryBreakdown[item.category] !== undefined) {
        categoryBreakdown[item.category] += co2Val;
      }
    });

    return res.status(200).json({
      today: Number(todayCarbon.toFixed(2)),
      thisMonth: Number(monthCarbon.toFixed(2)),
      total: Number(totalCarbon.toFixed(2)),
      totalCarbon: totalCarbon.toFixed(1),
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    return res.status(200).json({
      today: 0,
      thisMonth: 0,
      total: 0,
      totalCarbon: "0.0",
      categoryBreakdown: { Transport: 0, Energy: 0, Food: 0, Waste: 0, Water: 0 },
    });
  }
};