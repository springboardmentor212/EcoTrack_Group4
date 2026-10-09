const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  try {
    const { userId } = req.query;

    // Top 10 users based on Eco Points
    const topUsers = await User.find()
      .select("fullName ecoPoints level picture")
      .sort({ ecoPoints: -1 })
      .limit(10);

    let currentUserRank = null;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const higherRankUsers = await User.countDocuments({ ecoPoints: { $gt: user.ecoPoints } });
        currentUserRank = {
          rank: higherRankUsers + 1,
          fullName: user.fullName,
          ecoPoints: user.ecoPoints,
          level: user.level,
        };
      }
    }

    res.status(200).json({
      success: true,
      leaderboard: topUsers,
      currentUserRank,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};