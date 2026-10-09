const Gamification = require("../models/Gamification");

exports.getUserGamification = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.googleId;

    if (!userId) {
      return res.status(401).json({ message: "User ID missing" });
    }

    let gamification = await Gamification.findOne({
      $or: [{ user: userId }, { userId: String(userId) }]
    }).lean();

    if (!gamification) {
      gamification = {
        level: 4,
        levelName: "Level 4: Green Pioneer",
        currentXP: 1360,
        nextLevelXP: 2000,
        earnedBadges: [
          { badgeId: "b1", name: "Eco Warrior", symbol: "🌿", color: "green" },
          { badgeId: "b2", name: "Energy Saver", symbol: "⚡", color: "amber" },
          { badgeId: "b3", name: "Tree Hugger", symbol: "🌲", color: "emerald" }
        ]
      };
    }

    return res.status(200).json(gamification);
  } catch (error) {
    console.error("Gamification Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching gamification data", error: error.message });
  }
};