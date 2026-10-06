const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge"); 


exports.getChallenges = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.params.userId;

    const challenges = await Challenge.find().lean();
    const userParticipations = await UserChallenge.find({ 
      $or: [{ user: userId }, { userId }] 
    }).lean();

    const pMap = {};
    userParticipations.forEach((p) => {
      const cId = (p.challenge || p.challengeId)?.toString();
      if (cId) {
        pMap[cId] = p;
      }
    });

    const result = challenges.map((ch) => {
      const p = pMap[ch._id.toString()];
      return {
        ...ch,
        isJoined: !!p,
        userStatus: p ? p.status : "AVAILABLE",
        userProgress: p ? (p.currentProgress || p.progress || 0) : 0,
      };
    });

    res.status(200).json({ success: true, challenges: result });
  } catch (error) {
    console.error("Error in getChallenges:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const challengeId = req.params.id || req.body.challengeId;

    if (!userId || !challengeId) {
      return res.status(400).json({ success: false, message: "User ID or Challenge ID missing" });
    }

    let existing = await UserChallenge.findOne({
      $or: [{ user: userId }, { userId }],
      $or: [{ challenge: challengeId }, { challengeId }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already joined this challenge" });
    }

    const participation = new UserChallenge({
      user: userId,
      userId: userId,
      challenge: challengeId,
      challengeId: challengeId,
      status: "Active"
    });

    await participation.save();

    res.status(201).json({ 
      success: true, 
      message: "Joined successfully", 
      participation 
    });
  } catch (error) {
    console.error("Error in joinChallenge:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};