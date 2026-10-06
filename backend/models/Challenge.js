const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  challengeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  tag: { type: String, required: true },
  description: { type: String, required: true },
  rewardPoints: { type: Number, default: 100 },
  rewardXP: { type: Number, default: 100 },
  targetGoal: { type: Number, default: 1 },
  unit: { type: String, default: "Times" },
  iconName: { type: String, default: "Recycle" },
  levelRequired: { type: Number, required: true },
});

module.exports = mongoose.model("Challenge", challengeSchema);