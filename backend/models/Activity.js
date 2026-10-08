const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Transport", "Energy", "Food", "Waste", "Water", "Other"],
    },
    activityType: {
      type: String,
      required: true,
    },
    activityMode: {
      type: String,
      enum: ["emission", "saving"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    passengers: {
      type: Number,
      default: 1,
    },
    carbonOutput: {
      type: Number,
      default: 0,
    },
    carbonSaved: {
      type: Number,
      default: 0,
    },
    activityDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);