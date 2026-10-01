const getRecommendations = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Recommendation service is connected",
      recommendations: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};