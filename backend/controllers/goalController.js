const Goal = require("../models/Goal");

exports.createGoal = async (req, res) => {
  try {
    const { title, category, targetValue, targetCompletionDate } = req.body;
    const userId = req.user.id;

    const newGoal = await Goal.create({
      userId,
      title,
      category,
      targetValue,
      targetCompletionDate,
    });

    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    const activeGoalsCount = goals.filter((g) => g.status === "in progress").length;
    const completedGoalsCount = goals.filter((g) => g.status === "completed").length;

    res.json({
      goals,
      stats: {
        active: activeGoalsCount,
        completed: completedGoalsCount,
        streakDays: 18,
        successRate: "78%",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals", error: error.message });
  }
};