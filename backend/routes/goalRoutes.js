const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Tracker = require("../models/Tracker");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let authMiddleware = (req, res, next) => next();
try {
  authMiddleware = require("../middleware/authMiddleware");
} catch (err) {
  console.log("authMiddleware fallback active");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const formatDateToYYYYMMDD = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateGoalStreak = (trackers) => {
  if (!trackers || trackers.length === 0) return 0;

  const dateSet = new Set(
    trackers
      .map((item) => {
        const date = item.activityDate || item.createdAt || item.date;
        return date ? formatDateToYYYYMMDD(date) : null;
      })
      .filter(Boolean)
  );

  if (dateSet.size === 0) return 0;

  const dates = Array.from(dateSet).sort().reverse();
  const todayStr = formatDateToYYYYMMDD(new Date());
  const today = new Date(`${todayStr}T00:00:00`);
  const latestDate = new Date(`${dates[0]}T00:00:00`);

  const differenceFromToday = Math.floor(
    (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (differenceFromToday > 1) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(`${dates[i]}T00:00:00`);
    const previous = new Date(`${dates[i + 1]}T00:00:00`);

    const difference = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (difference === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Flexible Category Normalization
const normalizeCategory = (cat) => {
  if (!cat) return "overall";
  const lower = String(cat).toLowerCase().trim();

  if (lower.includes("transport")) return "transport";
  if (lower.includes("energy") || lower.includes("electric")) return "energy";
  if (lower.includes("food")) return "food";
  if (lower.includes("waste")) return "waste";
  if (lower.includes("water")) return "water";
  if (lower.includes("overall") || lower.includes("all")) return "overall";

  return lower;
};

// GET /api/goals/ai-recommendation
router.get("/ai-recommendation", async (req, res) => {
  const dynamicRecommendations = [
    {
      title: "Try Cycling for Short Commutes",
      category: "Transport",
      targetValue: "15",
      targetUnit: "kg CO2e",
      targetDate: "2026-10-31",
      description: "Cycling short distances instead of driving directly generates CO2 savings.",
    },
    {
      title: "Save Energy at Home",
      category: "Energy",
      targetValue: "30",
      targetUnit: "kg CO2e",
      targetDate: "2026-11-15",
      description: "Reduce electricity usage to maintain net carbon savings.",
    },
  ];

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const prompt = `
      Act as an Eco-Friendly Carbon Footprint Assistant.
      Return ONLY raw JSON in this format:
      {
        "title": "Goal title",
        "category": "Transport" OR "Energy" OR "Food" OR "Waste" OR "Water" OR "Overall",
        "targetValue": "25",
        "targetUnit": "kg CO2e",
        "targetDate": "2026-10-31",
        "description": "Short reasoning."
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const cleanJsonText = result.response
      .text()
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return res.status(200).json(JSON.parse(cleanJsonText));
  } catch (error) {
    const randomIndex = Math.floor(Math.random() * dynamicRecommendations.length);
    return res.status(200).json(dynamicRecommendations[randomIndex]);
  }
});

// GET /api/goals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rawUserId =
      req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";
    const currentUserId = String(rawUserId);

    const goals = await Goal.find({
      $or: [
        { userId: currentUserId },
        { userId: "guest" },
        { userId: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const trackers = await Tracker.find({
      $or: [
        { userId: currentUserId },
        { userId: "guest" },
        { userId: { $exists: false } },
      ],
    }).lean();

    const formattedGoals = (goals || []).map((g) => {
      const catKey = normalizeCategory(g.category);

      let totalEmitted = 0;
      let totalSaved = 0;

      (trackers || []).forEach((t) => {
        const trackerCat = normalizeCategory(t.category);
        const categoryMatches = catKey === "overall" || trackerCat === catKey;

        if (categoryMatches) {
          const savedVal = Number(t.carbonSaved || t.saved || t.co2Saved || 0);
          const emittedVal = Number(t.carbonOutput || t.emitted || t.co2Emitted || t.co2 || 0);

          if (savedVal > 0) totalSaved += savedVal;
          if (emittedVal > 0) totalEmitted += emittedVal;
        }
      });

      const targetVal = parseFloat(g.targetValue) || 1;
      
      // OPTION 1: Net calculation (Saved - Emitted) with lower bound 0
      // OPTION 2: Pure Savings Progress = totalSaved (High emissions won't block saved progress)
      // Standard Net calculation:
      let netValue = totalSaved - totalEmitted;
      
      // If emissions exceed savings, show totalSaved progress so goals don't stay locked at 0%:
      const currentProgress = netValue > 0 
        ? Number(netValue.toFixed(1)) 
        : Number(totalSaved.toFixed(1));

      const percent = Math.min(100, Number(((currentProgress / targetVal) * 100).toFixed(1)));
      const remainingBalance = Math.max(0, Number((targetVal - currentProgress).toFixed(1)));
      const isCompleted = currentProgress >= targetVal;

      return {
        _id: g._id,
        title: g.title || "Untitled Goal",
        category: g.category || "Overall",
        targetValue: targetVal,
        targetUnit: g.targetUnit || "kg CO2e",
        currentProgress,
        totalEmitted: Number(totalEmitted.toFixed(1)),
        totalSaved: Number(totalSaved.toFixed(1)),
        percent,
        remainingBalance,
        deadline: g.targetCompletionDate
          ? new Date(g.targetCompletionDate).toISOString().split("T")[0]
          : "2026-10-31",
        isCompleted,
      };
    });

    const activeGoals = formattedGoals.filter((g) => !g.isCompleted);
    const completedGoals = formattedGoals.filter((g) => g.isCompleted);
    const totalGoals = formattedGoals.length;
    const successRatePercent = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0;
    const calculatedStreak = calculateGoalStreak(trackers);

    res.status(200).json({
      goals: formattedGoals,
      activeGoals,
      completedGoals,
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      streak: calculatedStreak,
      successRate: `${successRatePercent}%`,
    });
  } catch (error) {
    console.error("Goals Fetch Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/goals
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, targetValue, targetUnit, targetCompletionDate } = req.body;
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";

    const newGoal = new Goal({
      userId: String(rawUserId),
      title,
      category: category || "Overall",
      targetValue: parseFloat(targetValue) || 0,
      targetUnit: targetUnit || "kg CO2e",
      targetCompletionDate,
      createdAt: new Date(),
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;