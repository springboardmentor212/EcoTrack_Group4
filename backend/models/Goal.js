const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    targetDate: { type: Date, required: true },
    progressPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);