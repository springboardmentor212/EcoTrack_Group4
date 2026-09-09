const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "kg CO2e / mo",
    },
    targetCompletionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["in progress", "completed"],
      default: "in progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);