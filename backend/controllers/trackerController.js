const Tracker = require("../models/Tracker");
const Goal = require("../models/Goal");

// Helper function to extract userId standardly
const getUserId = (req) => {
  return String(req.user?.id || req.user?._id || req.userId || req.user?.email || "guest");
};

// Map tracker categories to Goal categories safely
const mapCategoryToGoal = (cat) => {
  if (!cat) return "General";
  const lower = String(cat).toLowerCase();
  if (lower.includes("transport") || lower.includes("bus") || lower.includes("car")) return "Green Transportation";
  if (lower.includes("energy") || lower.includes("electric") || lower.includes("lpg")) return "Energy Usage";
  if (lower.includes("waste") || lower.includes("plastic")) return "Waste Reduction";
  if (lower.includes("food") || lower.includes("meal")) return "Food Habit";
  if (lower.includes("water")) return "Carbon Offset";
  return cat;
};

// 1. Log Activity & Auto-Update Goal Progress Dynamic
exports.logActivity = async (req, res) => {
  try {
    const { category, activityType, subType, value, carbonOutput, co2, activityDate, date } = req.body;
    const currentUserId = getUserId(req);

    const co2Value = Number(co2 !== undefined ? co2 : carbonOutput) || 0;
    const usageValue = Number(value) || 0;
    const cleanCategory = category || "General";
    const mappedGoalCategory = mapCategoryToGoal(cleanCategory);

    // Create & Save Log
    const newLog = new Tracker({
      userId: currentUserId,
      category: cleanCategory,
      subType: subType || activityType || "",
      value: usageValue,
      co2: co2Value,
      date: date || activityDate || new Date().toISOString().split("T")[0],
    });

    await newLog.save();

    // Flexible Category Goal Progress Update
    await Goal.updateMany(
      {
        $or: [{ userId: currentUserId }, { userId: "guest" }],
        $or: [
          { category: cleanCategory },
          { category: mappedGoalCategory },
          { category: { $regex: cleanCategory, $options: "i" } },
          { category: { $regex: mappedGoalCategory, $options: "i" } }
        ]
      },
      { $inc: { currentProgress: co2Value } }
    );

    return res.status(201).json({ message: "Activity logged and goals updated successfully", data: newLog });
  } catch (error) {
    console.error("Error in logActivity:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Get History (For Profile & Activity Logs)
exports.getHistory = async (req, res) => {
  try {
    const currentUserId = getUserId(req);

    // Fetch logs for current user OR guest
    const history = await Tracker.find({
      $or: [{ userId: currentUserId }, { userId: "guest" }]
    }).sort({ createdAt: -1 }).lean();

    const formattedHistory = (history || []).map((item) => ({
      _id: item._id,
      category: item.category,
      activityType: item.subType || item.category,
      value: item.value,
      carbonOutput: item.co2,
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
    const history = await Tracker.find({
      $or: [{ userId: currentUserId }, { userId: "guest" }]
    }).lean();

    let totalCarbon = 0;
    const categoryBreakdown = {
      Transport: 0,
      Energy: 0,
      Food: 0,
      Waste: 0,
      Water: 0,
    };

    (history || []).forEach((item) => {
      const co2Val = Number(item.co2) || 0;
      totalCarbon += co2Val;
      if (categoryBreakdown[item.category] !== undefined) {
        categoryBreakdown[item.category] += co2Val;
      }
    });

    return res.status(200).json({
      totalCarbon: totalCarbon.toFixed(1),
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    return res.status(200).json({
      totalCarbon: "0.0",
      categoryBreakdown: { Transport: 0, Energy: 0, Food: 0, Waste: 0, Water: 0 },
    });
  }
};