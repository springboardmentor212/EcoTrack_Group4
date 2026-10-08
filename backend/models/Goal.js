const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest",
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    goalType: {
      type: String,
      enum: ["emission_limit", "saving_target"],
      default: "saving_target",
    },
    targetValue: {
      type: Number,
      required: true,
      default: 0,
    },
    targetUnit: {
      type: String,
      default: "kg CO2e",
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    targetCompletionDate: {
      type: String,
      default: "",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);