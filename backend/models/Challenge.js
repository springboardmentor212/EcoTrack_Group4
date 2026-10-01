const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
    },

    points: {
      type: Number,
      default: 0,
    },

    participants: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed", "inactive"],
      default: "active",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Challenge", challengeSchema);