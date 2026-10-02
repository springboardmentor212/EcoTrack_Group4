const getGamificationData = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Gamification service is connected",
      data: {
        points: 0,
        level: 1,
        badges: [],
        streak: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch gamification data",
    });
  }
};

module.exports = {
  getGamificationData,
};