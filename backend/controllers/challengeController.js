const getChallenges = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Challenge service is connected",
      challenges: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch challenges",
    });
  }
};

const createChallenge = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Challenge creation endpoint is connected",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create challenge",
    });
  }
};

module.exports = {
  getChallenges,
  createChallenge,
};