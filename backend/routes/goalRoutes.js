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

// Helper: Local Date-ஐ YYYY-MM-DD வடிவத்தில் பெற
const formatDateToYYYYMMDD = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Helper: தொடர்ச்சியாக Activity Log செய்த நாட்களைக் (Streak) கணக்கிட
const calculateGoalStreak = (trackers) => {
  if (!trackers || trackers.length === 0) return 0;

  // 1. தனித்துவமான (Unique) YYYY-MM-DD தேதிகளைப் பிரித்தெடுத்தல்
  const dateSet = new Set(
    trackers
      .map((item) => {
        const date = item.activityDate || item.createdAt || item.date;
        return date ? formatDateToYYYYMMDD(date) : null;
      })
      .filter(Boolean)
  );

  if (dateSet.size === 0) return 0;

  // 2. தேதிகளை வரிசைப்படுத்தி (Sort) புதியது முதல் பழையது வரை மாற்றுதல்
  const dates = Array.from(dateSet).sort().reverse();

  // 3. இன்றைய தேதி மற்றும் கடைசியாக பதிவுசெய்த தேதியை சரிபார்த்தல்
  const todayStr = formatDateToYYYYMMDD(new Date());
  const today = new Date(`${todayStr}T00:00:00`);
  const latestDate = new Date(`${dates[0]}T00:00:00`);

  const differenceFromToday = Math.floor(
    (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // கடைசியாக பதிவுசெய்தது நேற்று அல்லது இன்று இல்லை என்றால் Streak = 0
  if (differenceFromToday > 1) {
    return 0;
  }

  // 4. தொடர்ச்சியான நாட்களை எண்ணுதல் (Consecutive Count)
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

const normalizeCategory = (cat) => {
  if (!cat) return "general";
  const lower = String(cat).toLowerCase().trim();

  if (lower.includes("transport")) return "transport";
  if (lower.includes("energy") || lower.includes("electric")) return "energy";
  if (lower.includes("food")) return "food";
  if (lower.includes("waste")) return "waste";
  if (lower.includes("water")) return "water";

  return lower;
};

// GET /api/goals/ai-recommendation
router.get("/ai-recommendation", async (req, res) => {
  const dynamicRecommendations = [
    {
      title: "Switch to LED Bulbs & Save Energy",
      category: "Energy",
      targetValue: "18",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-10-31",
      description:
        "Replacing traditional bulbs with LEDs reduces energy consumption significantly.",
    },
    {
      title: "Use Public Transport 3 Days a Week",
      category: "Transport",
      targetValue: "35",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-11-15",
      description:
        "Replacing personal vehicle drives with public transit cuts down carbon footprint.",
    },
    {
      title: "Reduce Meal Carbon Emissions",
      category: "Food",
      targetValue: "25",
      targetUnit: "kg CO2e / mo",
      targetDate: "2026-12-01",
      description:
        "Opting for lower-carbon plant-based meals weekly reduces overall dietary emissions.",
    },
  ];

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const prompt = `
      Act as an Eco-Friendly Carbon Footprint Assistant.
      Return ONLY raw JSON in this format:
      {
        "title": "Goal title",
        "category": "Transport" OR "Energy" OR "Food" OR "Waste" OR "Water",
        "targetValue": "25",
        "targetUnit": "kg CO2e / mo",
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
    const randomIndex = Math.floor(
      Math.random() * dynamicRecommendations.length
    );
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

      const goalCreatedTime = g.createdAt
        ? new Date(g.createdAt).getTime()
        : 0;

      const goalDeadlineTime = g.targetCompletionDate
        ? new Date(g.targetCompletionDate).setHours(23, 59, 59, 999)
        : new Date("2026-12-31").getTime();

      const actualEmitted = (trackers || [])
        .filter((t) => {
          const trackerCat = normalizeCategory(t.category);
          const trackerTime = new Date(
            t.createdAt || t.date || t.activityDate || 0
          ).getTime();

          return (
            trackerCat === catKey &&
            trackerTime >= goalCreatedTime &&
            trackerTime <= goalDeadlineTime
          );
        })
        .reduce((sum, t) => {
          const co2Val =
            Number(
              t.co2 !== undefined
                ? t.co2
                : t.carbonOutput !== undefined
                ? t.carbonOutput
                : t.co2Emitted !== undefined
                ? t.co2Emitted
                : t.emission !== undefined
                ? t.emission
                : 0
            ) || 0;
          return sum + co2Val;
        }, 0);

      const targetVal = parseFloat(g.targetValue) || 1;
      const remainingBalance = Math.max(0, targetVal - actualEmitted);

      const percent =
        targetVal > 0
          ? Math.max(
              0,
              Math.min(
                100,
                Number(((remainingBalance / targetVal) * 100).toFixed(1))
              )
            )
          : 0;

      const isLimitExceeded = actualEmitted >= targetVal;
      const isCompleted = Boolean(g.isCompleted);

      return {
        _id: g._id,
        title: g.title || "Untitled Goal",
        category: g.category || "General",
        targetValue: targetVal,
        targetUnit: g.targetUnit || "kg CO2e",
        target: `${targetVal} ${g.targetUnit || "kg CO2e"}`,
        currentProgress: Number(actualEmitted.toFixed(1)),
        percent,
        remainingBalance: Number(remainingBalance.toFixed(1)),
        deadline: g.targetCompletionDate
          ? new Date(g.targetCompletionDate).toISOString().split("T")[0]
          : "2026-10-31",
        isCompleted: isCompleted,
        isLimitExceeded: isLimitExceeded,
      };
    });

    const activeCount = formattedGoals.filter(
      (g) => !g.isCompleted && !g.isLimitExceeded
    ).length;
    const completedCount = formattedGoals.filter((g) => g.isCompleted).length;
    const totalGoals = formattedGoals.length;

    const successRatePercent =
      totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

    // உண்மையான தொடர்ச்சியான நாட்களின் Streak கணக்கீடு
    const calculatedStreak = calculateGoalStreak(trackers);

    res.status(200).json({
      goals: formattedGoals,
      activeCount,
      completedCount,
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
    const { title, category, targetValue, targetUnit, targetCompletionDate } =
      req.body;
    const rawUserId =
      req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";

    const newGoal = new Goal({
      userId: String(rawUserId),
      title,
      category,
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