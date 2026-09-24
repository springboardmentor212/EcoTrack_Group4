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

// 1. Log Activity (Emissions & Savings)
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
    const savedVal = mode === "saving" ? (Number(carbonSaved) || 0) : 0;
    const usageValue = Number(value) || 0;
    const cleanCategory = category || "General";

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
      activityMode: item.activityMode || (item.carbonSaved > 0 ? "saving" : "emission"),
      value: item.value,
      passengers: item.passengers || 1,
      carbonOutput: Number(item.carbonOutput || (item.activityMode === "saving" ? 0 : item.co2) || 0),
      carbonSaved: Number(item.carbonSaved || (item.activityMode === "saving" ? item.co2 : 0) || 0),
      activityDate: item.date || item.createdAt?.toISOString()?.split("T")[0],
    }));

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error in getHistory:", error);
    return res.status(200).json([]);
  }
};

// 3. Get Summary (Net Footprint Computation)
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