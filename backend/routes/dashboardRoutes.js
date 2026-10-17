const express = require("express");
const router = express.Router();
const Tracker = require("../models/Tracker");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let authMiddleware = (req, res, next) => next();
try {
  authMiddleware = require("../middleware/authMiddleware");
} catch (err) {
  console.log("authMiddleware fallback active");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// GET /api/dashboard - Gemini AI Recommendations & User Footprint Overview
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rawUserId =
      req.user?.id || req.user?._id || req.userId || req.user?.email || "guest";
    const currentUserId = String(rawUserId);

    // 1. Fetch user recent tracker records
    const trackerLogs = await Tracker.find({
      $or: [
        { userId: currentUserId },
        { userId: "guest" },
        { userId: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1, activityDate: -1 })
      .lean();

    // 2. Calculate Total Emissions & Savings
    let totalEmissionsKg = 0;
    let totalSavedKg = 0;

    const categoryTotals = {
      transport: { emission: 0, saved: 0 },
      energy: { emission: 0, saved: 0 },
      food: { emission: 0, saved: 0 },
      waste: { emission: 0, saved: 0 },
      water: { emission: 0, saved: 0 },
    };

    trackerLogs.forEach((log) => {
      const catKey = (log.category || "").toLowerCase().trim();
      const mode =
        log.activityMode || (Number(log.carbonSaved) > 0 ? "saving" : "emission");

      const savedVal = Number(log.carbonSaved || log.co2 || 0);
      const emittedVal = Number(log.carbonOutput || log.co2 || 0);

      if (mode === "saving") {
        totalSavedKg += savedVal;
        if (categoryTotals[catKey]) categoryTotals[catKey].saved += savedVal;
      } else {
        totalEmissionsKg += emittedVal;
        if (categoryTotals[catKey]) categoryTotals[catKey].emission += emittedVal;
      }
    });

    const netFootprintKg = Math.abs(totalEmissionsKg - totalSavedKg);

    const categoriesArray = Object.keys(categoryTotals).map((catName) => {
      const emission = categoryTotals[catName].emission;
      const percentage =
        totalEmissionsKg > 0
          ? Math.round((emission / totalEmissionsKg) * 100)
          : 0;

      return {
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        percentage,
        emission: Number(emission.toFixed(1)),
      };
    });

    // 3. Dynamic Gemini AI Recommendations Logic
    let aiRecommendations = [];

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
        throw new Error("GEMINI_API_KEY missing");
      }

      const userSummaryPrompt = `
        You are an AI Carbon Advisor. User stats:
        - Total Emissions: ${totalEmissionsKg.toFixed(1)} kg CO2e
        - Total CO2 Saved: ${totalSavedKg.toFixed(1)} kg CO2e
        - Category Breakdown: ${JSON.stringify(categoriesArray)}

        Based on these specific figures, generate exactly 4 personalized actionable tips.
        
        CRITICAL: Return ONLY raw JSON array. No markdown code blocks or ticks:
        [
          {
            "icon": "transport" | "bolt" | "leaf" | "water" | "energy" | "shield" | "sun",
            "title": "Clear action recommendation title",
            "subtitle": "Potential saving: X.X kg CO₂/day"
          }
        ]
      `;

      // Correct Model Name for standard Google Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userSummaryPrompt);
      
      if (result && result.response) {
        const responseText = result.response.text();
        const cleanJsonText = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        aiRecommendations = JSON.parse(cleanJsonText);
      } else {
        throw new Error("No response text from Gemini API");
      }
    } catch (aiErr) {
      console.warn("Dashboard Gemini AI fallback executed:", aiErr.message);

      const fallbackPool = [
        {
          icon: "transport",
          title: "Try cycling for short commutes",
          subtitle: "Potential saving: 1.2 kg CO₂/day",
        },
        {
          icon: "bolt",
          title: "Switch off idle appliances & LED lights",
          subtitle: "Potential saving: 0.8 kg CO₂/day",
        },
        {
          icon: "leaf",
          title: "Opt for 2 plant-based meals per week",
          subtitle: "Potential saving: 2.5 kg CO₂/meal",
        },
        {
          icon: "water",
          title: "Reduce shower time by 3 minutes",
          subtitle: "Potential saving: 0.4 kg CO₂/day",
        },
        {
          icon: "sun",
          title: "Use natural lighting during peak hours",
          subtitle: "Potential saving: 0.5 kg CO₂/day",
        },
        {
          icon: "energy",
          title: "Unplug chargers when fully charged",
          subtitle: "Potential saving: 0.3 kg CO₂/day",
        }
      ];

      // Shuffle fallback recommendations dynamically on every reload
      aiRecommendations = [...fallbackPool].sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    res.status(200).json({
      carbonFootprint: {
        totalEmissionsKg: Number(totalEmissionsKg.toFixed(1)),
        totalSavedKg: Number(totalSavedKg.toFixed(1)),
        netFootprintKg: Number(netFootprintKg.toFixed(1)),
        categories: categoriesArray,
      },
      recentActivity: trackerLogs.slice(0, 5),
      aiRecommendations,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
});

module.exports = router;