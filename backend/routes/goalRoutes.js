const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Tracker = require("../models/Tracker");
let Notification;
try {
  Notification = require("../models/Notification");
} catch (err) {
  console.log("Notification model optional fallback");
}
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

const normalizeCategory = (cat, activityType) => {
  const combined = `${cat || ""} ${activityType || ""}`.toLowerCase().trim();

  if (
    combined.includes("transport") ||
    combined.includes("walk") ||
    combined.includes("cycle") ||
    combined.includes("bus") ||
    combined.includes("train") ||
    combined.includes("commute")
  ) {
    return "transport";
  }
  if (
    combined.includes("energy") ||
    combined.includes("electric") ||
    combined.includes("bulb") ||
    combined.includes("power")
  ) {
    return "energy";
  }
  if (combined.includes("food") || combined.includes("diet")) return "food";
  if (combined.includes("waste") || combined.includes("plastic")) return "waste";
  if (combined.includes("water")) return "water";

  return "overall";
};

// GET /api/goals/ai-recommendation (Truly Dynamic Gemini Prompt)
router.get("/ai-recommendation", authMiddleware, async (req, res) => {
  const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";
  
  try {
    // Get recent activity of current user to personalise prompt
    const recentLogs = await Tracker.find({ userId: String(rawUserId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const categoriesLogged = [...new Set(recentLogs.map((l) => l.category || "General"))];
    const categoryContext = categoriesLogged.length > 0 ? categoriesLogged.join(", ") : "Transport, Energy";

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
      throw new Error("GEMINI_API_KEY missing");
    }

    const prompt = `
      You are an AI Carbon Footprint Assistant. 
      The user recently logged activity in categories: [${categoryContext}].
      Generate ONE unique, highly effective, creative goal recommendation.
      
      CRITICAL: Return ONLY raw valid JSON (no markdown fence, no backticks):
      {
        "title": "Short creative goal title",
        "category": "Transport" OR "Energy" OR "Food" OR "Waste" OR "Water" OR "Overall",
        "targetValue": "20",
        "targetUnit": "kg CO2e",
        "targetDate": "2026-10-31",
        "description": "Customized 1-sentence motivation based on their activities."
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    const responseText = result.response.text();
    const cleanJsonText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return res.status(200).json(JSON.parse(cleanJsonText));
  } catch (error) {
    console.warn("Gemini AI Goals fallback triggered:", error.message);
    
    // Dynamic randomized fallback array to ensure recommendations vary
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
      {
        title: "Adopt 2 Plant-Based Meals",
        category: "Food",
        targetValue: "12",
        targetUnit: "kg CO2e",
        targetDate: "2026-10-31",
        description: "Replacing meat with plant meals reduces personal carbon impact effectively.",
      },
      {
        title: "Zero Waste Weekend",
        category: "Waste",
        targetValue: "10",
        targetUnit: "kg CO2e",
        targetDate: "2026-11-05",
        description: "Eliminate single-use plastics to decrease waste emissions.",
      }
    ];

    const randomIndex = Math.floor(Math.random() * dynamicRecommendations.length);
    return res.status(200).json(dynamicRecommendations[randomIndex]);
  }
});

// GET /api/goals (Strict User Isolation)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email;

    if (!rawUserId || rawUserId === "guest") {
      return res.status(200).json({
        goals: [],
        activeGoals: [],
        completedGoals: [],
        activeCount: 0,
        completedCount: 0,
        streak: 0,
        successRate: "0%",
      });
    }

    const currentUserId = String(rawUserId);

    const goals = await Goal.find({ userId: currentUserId }).sort({ createdAt: -1 });
    const trackers = await Tracker.find({ userId: currentUserId }).lean();

    const formattedGoals = [];

    for (const g of goals) {
      const goalCatKey = normalizeCategory(g.category, g.title);

      let goalCreatedTime = 0;
      if (g.createdAt) {
        goalCreatedTime = new Date(g.createdAt).getTime();
      } else if (g._id && typeof g._id.getTimestamp === "function") {
        goalCreatedTime = g._id.getTimestamp().getTime();
      }

      let totalEmitted = 0;
      let totalSaved = 0;

      (trackers || []).forEach((t) => {
        const trackerCatKey = normalizeCategory(
          t.category,
          t.activityType || t.title || t.type
        );

        const categoryMatches =
          goalCatKey === "overall" || trackerCatKey === goalCatKey;

        let trackerTime = 0;
        if (t.createdAt) {
          trackerTime = new Date(t.createdAt).getTime();
        } else if (t.activityDate) {
          trackerTime = new Date(t.activityDate).getTime();
        } else if (t.date) {
          trackerTime = new Date(t.date).getTime();
        } else if (t._id && typeof t._id.getTimestamp === "function") {
          trackerTime = t._id.getTimestamp().getTime();
        }

        const isAfterGoal = trackerTime >= (goalCreatedTime - 5000);

        if (categoryMatches && isAfterGoal) {
          const savedVal = Number(
            t.carbonSaved ?? t.saved ?? t.co2Saved ?? t.savedCo2 ?? 0
          );
          const emittedVal = Number(
            t.carbonOutput ?? t.emitted ?? t.co2Emitted ?? t.co2 ?? 0
          );

          if (savedVal > 0) totalSaved += savedVal;
          if (emittedVal > 0) totalEmitted += emittedVal;
        }
      });

      const targetVal = parseFloat(g.targetValue) || 1;
      const currentProgress = Math.max(0, Number((totalSaved - totalEmitted).toFixed(1)));

      let percent = 0;
      if (targetVal > 0 && currentProgress > 0) {
        percent = Math.min(
          100,
          Number(((currentProgress / targetVal) * 100).toFixed(1))
        );
      }

      const remainingBalance = Math.max(
        0,
        Number((targetVal - currentProgress).toFixed(1))
      );
      const isCompleted = targetVal > 0 && currentProgress >= targetVal;

      if (isCompleted && !g.isCompleted) {
        g.isCompleted = true;
        g.completedAt = new Date();
        await g.save();

        if (Notification) {
          try {
            await Notification.create({
              userId: currentUserId,
              title: "🎉 Goal Achieved!",
              message: `Congratulations! You completed your goal: "${g.title}" by saving ${currentProgress} kg CO2e!`,
              type: "goal_completed",
              isRead: false,
              createdAt: new Date(),
            });
          } catch (notifErr) {
            console.log("Failed to create goal notification:", notifErr.message);
          }
        }
      }

      formattedGoals.push({
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
        isCompleted: Boolean(g.isCompleted || isCompleted),
      });
    }

    const activeGoals = formattedGoals.filter((g) => !g.isCompleted);
    const completedGoals = formattedGoals.filter((g) => g.isCompleted);
    const totalGoals = formattedGoals.length;
    const successRatePercent =
      totalGoals > 0
        ? Math.round((completedGoals.length / totalGoals) * 100)
        : 0;
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
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.user?.email;

    if (!rawUserId || rawUserId === "guest") {
      return res.status(400).json({ message: "Please log in to create goals." });
    }

    const newGoal = new Goal({
      userId: String(rawUserId),
      title,
      category: category || "Overall",
      targetValue: parseFloat(targetValue) || 0,
      targetUnit: targetUnit || "kg CO2e",
      targetCompletionDate,
      isCompleted: false,
      currentProgress: 0,
      createdAt: new Date(),
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;