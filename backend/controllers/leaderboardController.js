const getLeaderboard = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Leaderboard service is connected",
      leaderboard: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};

module.exports = {
  getLeaderboard,
};