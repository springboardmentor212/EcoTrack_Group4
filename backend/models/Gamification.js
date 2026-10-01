const mongoose = require("mongoose");

const gamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    points: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    badges: {
      type: [String],
      default: [],
    },

    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Gamification",
  gamificationSchema
);