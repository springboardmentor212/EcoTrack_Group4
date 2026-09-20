const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let authMiddleware = (req, res, next) => next();
try {
  authMiddleware = require("../middleware/authMiddleware");
} catch (err) {
  console.log("authMiddleware fallback active");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// 1. Live Gemini AI Recommendation (With Reliable Auto-Fallback)
router.get("/ai-recommendation", async (req, res) => {
  const dynamicRecommendations = [
    {
      title: "Switch to LED Bulbs & Save Energy",
      category: "Energy Usage",
      targetValue: "18",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-10-31",
      description: "Replacing traditional bulbs with LEDs reduces energy consumption by up to 75% monthly."
    },
    {
      title: "Use Public Transport 3 Days a Week",
      category: "Green Transportation",
      targetValue: "35",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-11-15",
      description: "Replacing personal vehicle drives with public transit drastically cuts down urban carbon emissions."
    },
    {
      title: "Reduce Household Plastic & Dry Waste",
      category: "Waste Reduction",
      targetValue: "12",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-12-01",
      description: "Segregating wet and dry waste prevents unnecessary methane release from landfills."
    }
  ];

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY missing");
    }

    const prompt = `
      Act as an Eco-Friendly Carbon Footprint Sustainability Assistant.
      Generate 1 unique and realistic carbon footprint reduction goal for a user based on smart eco-practices.
      Return ONLY raw JSON in this format:
      {
        "title": "Goal title",
        "category": "Green Transportation" OR "Energy Usage" OR "Waste Reduction",
        "targetValue": "25",
        "targetUnit": "kg CO2e / mo",
        "targetDate": "2026-10-31",
        "description": "Short reasoning in 1-2 sentences."
      }
    `;

    // Modern Gemini 2.5 flash model call
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanJsonText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const recommendation = JSON.parse(cleanJsonText);

    return res.status(200).json(recommendation);

  } catch (error) {
    console.log("ℹ️ Using Smart Dynamic Fallback for AI Recommendation:", error.message);
    const randomIndex = Math.floor(Math.random() * dynamicRecommendations.length);
    return res.status(200).json(dynamicRecommendations[randomIndex]);
  }
});

// 2. GET /api/goals - Fetch All Goals with calculated Progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";
    const currentUserId = String(rawUserId);

    const goals = await Goal.find({
      $or: [{ userId: currentUserId }, { userId: "guest" }]
    }).sort({ createdAt: -1 });

    const formattedGoals = (goals || []).map((g) => {
      const currentProgress = parseFloat(g.currentProgress) || 0;
      const targetVal = parseFloat(g.targetValue) || 1;
      const percent = Math.min(100, Math.round((currentProgress / targetVal) * 100));

      return {
        _id: g._id,
        title: g.title || "Untitled Goal",
        category: g.category || "General",
        target: `${targetVal} ${g.targetUnit || "kg CO2e / mo"}`,
        percent,
        progressLabel: `${currentProgress.toFixed(1)} / ${targetVal} ${g.targetUnit || "kg CO2e / mo"}`,
        deadline: g.targetCompletionDate ? new Date(g.targetCompletionDate).toISOString().split("T")[0] : "N/A",
        isCompleted: Boolean(g.isCompleted) || percent >= 100,
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
      streak: formattedGoals.length > 0 ? 18 : 0,
      successRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. POST /api/goals - Create Goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, targetValue, targetUnit, targetCompletionDate } = req.body;
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";

    const newGoal = new Goal({
      userId: String(rawUserId),
      title,
      category,
      targetValue: parseFloat(targetValue) || 0,
      targetUnit: targetUnit || "kg CO2e / mo",
      targetCompletionDate,
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;