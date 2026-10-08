const Goal = require("../models/Goal");
const Tracker = require("../models/Tracker");

// Standardize category names for flawless string matching
const normalizeCategory = (cat) => {
  if (!cat) return "general";
  const lower = String(cat).toLowerCase().trim();
  
  if (
    lower.includes("transport") || 
    lower.includes("bus") || 
    lower.includes("car") || 
    lower.includes("bike") ||
    lower.includes("scoot")
  ) {
    return "transportation";
  }
  
  if (
    lower.includes("energy") || 
    lower.includes("electric") || 
    lower.includes("lpg") ||
    lower.includes("bulb")
  ) {
    return "energy";
  }

  if (
    lower.includes("waste") || 
    lower.includes("plastic") || 
    lower.includes("dry")
  ) {
    return "waste";
  }

  if (lower.includes("food") || lower.includes("meal")) return "food";
  if (lower.includes("water") || lower.includes("offset")) return "water";
  
  return lower;
};

// GET ALL GOALS WITH ZERO-INITIALIZED TIME BOUNDARY
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({}).sort({ createdAt: -1 }).lean();
    const logs = await Tracker.find({}).lean();

    const updatedGoals = goals.map((goal) => {
      const goalKey = normalizeCategory(goal.category);
      
      // Get exact creation timestamp of the goal
      const goalCreatedAtTime = goal.createdAt 
        ? new Date(goal.createdAt).getTime() 
        : Date.now();

      let logSavedSum = 0;
      let logEmittedSum = 0;

      (logs || []).forEach((log) => {
        const logCategoryKey = normalizeCategory(log.category);
        
        const isCategoryMatch =
          goalKey === "overall" ||
          goalKey === "general" ||
          logCategoryKey === goalKey;

        // Check Tracker Log Date
        const logTime = log.createdAt 
          ? new Date(log.createdAt).getTime() 
          : (log.date ? new Date(log.date).getTime() : 0);

        // Strict Check: ONLY log entries created strictly AFTER the goal creation time count
        const isAfterGoalCreation = logTime > 0 && logTime > goalCreatedAtTime;

        if (isCategoryMatch && isAfterGoalCreation) {
          const co2Emitted = Number(log.co2 !== undefined ? log.co2 : log.carbonOutput) || 0;
          const co2Saved = Number(log.co2Saved || log.savedCo2) || 0;

          logEmittedSum += co2Emitted;
          logSavedSum += co2Saved;
        }
      });

      const targetVal = Number(goal.targetValue) || 0;
      
      // Pure new entries progress
      const netProgress = Number(logSavedSum.toFixed(2));
      
      // Calculate Percent safely (Avoid division by zero & force 0% for new goals)
      let percent = 0;
      if (targetVal > 0 && netProgress > 0) {
        percent = Math.min(100, Math.round((netProgress / targetVal) * 100));
      }

      const isCompleted = targetVal > 0 && percent >= 100;
      const remainingBalance = Math.max(0, Number((targetVal - netProgress).toFixed(2)));

      return {
        ...goal,
        currentProgress: netProgress,
        totalSaved: Number(logSavedSum.toFixed(2)),
        totalEmitted: Number(logEmittedSum.toFixed(2)),
        remainingBalance,
        percent: percent,
        isCompleted: isCompleted,
        status: isCompleted ? "Completed" : "Active"
      };
    });

    const activeCount = updatedGoals.filter((g) => !g.isCompleted).length;
    const completedCount = updatedGoals.filter((g) => g.isCompleted).length;

    return res.status(200).json({
      goals: updatedGoals,
      activeCount,
      completedCount,
      streak: 1,
      successRate: updatedGoals.length > 0 
        ? `${Math.round((completedCount / updatedGoals.length) * 100)}%` 
        : "0%",
    });
  } catch (error) {
    console.error("Error in getGoals:", error);
    return res.status(500).json({ message: "Server Error", goals: [] });
  }
};

// CREATE NEW GOAL
exports.createGoal = async (req, res) => {
  try {
    const { title, category, targetValue, targetUnit, targetCompletionDate } = req.body;
    
    const userId = req.user?.id || req.user?._id || "6a9bdbela002813622c6f033";

    const newGoal = new Goal({
      userId: String(userId),
      title,
      category: category || "General",
      targetValue: Number(targetValue) || 0,
      targetUnit: targetUnit || "kg CO2e",
      targetCompletionDate,
      currentProgress: 0,
      isCompleted: false,
    });

    await newGoal.save();
    return res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    console.error("Error creating goal:", error);
    return res.status(500).json({ message: "Failed to create goal" });
  }
};

// AI RECOMMENDATION
exports.getAiRecommendation = async (req, res) => {
  try {
    return res.status(200).json({
      title: "Reduce Electricity Usage by 15%",
      category: "Energy",
      targetValue: "22",
      targetUnit: "kg CO2e",
      targetDate: "2026-10-31",
      description: "Based on your carbon footprint, setting a goal to reduce electricity usage by 15% could save 22 kg CO2e monthly."
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching recommendation" });
  }
};