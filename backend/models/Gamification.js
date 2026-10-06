const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true }, // e.g., "🌿", "⚡", "🌲"
  color: { type: String, default: "green" },
  earnedAt: { type: Date, default: Date.now },
});

const gamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    level: { type: Number, default: 1 },
    levelName: { type: String, default: "Level 1: Eco Beginner" },
    currentXP: { type: Number, default: 0 },
    nextLevelXP: { type: Number, default: 1000 },
    totalPoints: { type: Number, default: 0 },
    earnedBadges: [badgeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gamification", gamificationSchema);