const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["Transport", "Energy", "Food", "Waste", "Water Usage"],
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    passengers: {
      type: Number,
      default: 1,
    },
    carbonOutput: {
      type: Number,
      required: true,
    },
    activityDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);