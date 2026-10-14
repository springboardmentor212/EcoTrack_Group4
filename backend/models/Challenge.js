const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tag: { type: String, default: "General" },
    description: { type: String },
    rewardPoints: { type: Number, default: 50 },
    rewardXP: { type: Number, default: 0 },
    targetGoal: { type: Number, default: 1 },
    unit: { type: String, default: "Times" },
    badgeName: { type: String },
    iconName: { type: String, default: "Zap" },
    levelRequired: { type: Number, default: 1 },
    isWeekly: { type: Boolean, default: false },
    // Time-Bound Fields for Weekly Drives
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);