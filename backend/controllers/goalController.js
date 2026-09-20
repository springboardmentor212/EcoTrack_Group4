const Goal = require("../models/Goal");

const getUserId = (req) => {
  const rawUserId = req.user?.id || req.user?._id || req.user?.sub || req.user?.email || "guest";
  return String(rawUserId);
};

// Create Goal
exports.createGoal = async (req, res) => {
  try {
    const { title, category, targetValue, targetUnit, targetCompletionDate } = req.body;
    const currentUserId = getUserId(req);

    const newGoal = new Goal({
      userId: currentUserId,
      title,
      category,
      targetValue: parseFloat(targetValue) || 0,
      targetUnit: targetUnit || "kg CO2e / mo",
      targetCompletionDate,
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    console.error("Error in createGoal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Goals List
exports.getGoals = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const goals = await Goal.find({ userId: currentUserId }).sort({ createdAt: -1 });

    const formattedGoals = (goals || []).map((g) => {
      const targetVal = parseFloat(g.targetValue) || 1;
      const currProgress = parseFloat(g.currentProgress) || 0;

      const percent = Math.min(
        100,
        Math.round((currProgress / targetVal) * 100)
      );

      return {
        _id: g._id,
        title: g.title || "Untitled Goal",
        category: g.category || "General",
        target: `${targetVal} ${g.targetUnit || "kg CO2e / mo"}`,
        percent,
        progressLabel: `${currProgress.toFixed(1)} / ${targetVal} ${g.targetUnit || "kg CO2e / mo"}`,
        deadline: g.targetCompletionDate
          ? new Date(g.targetCompletionDate).toISOString().split("T")[0]
          : "",
        isCompleted: Boolean(g.isCompleted),
      };
    });

    const activeCount = formattedGoals.filter((g) => !g.isCompleted).length;
    const completedCount = formattedGoals.filter((g) => g.isCompleted).length;
    const total = formattedGoals.length;
    const successRate = total > 0 ? `${Math.round((completedCount / total) * 100)}%` : "0%";

    res.status(200).json({
      goals: formattedGoals,
      activeCount,
      completedCount,
      streak: 18,
      successRate,
    });
  } catch (error) {
    console.error("Error in getGoals:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};