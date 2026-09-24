const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "guest",
      index: true,
    },
    category: {
      type: String,
      default: "General",
    },
    subType: {
      type: String,
      default: "",
    },
    activityMode: {
      type: String,
      enum: ["emission", "saving"],
      default: "emission",
    },
    value: {
      type: Number,
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
    co2: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tracker", trackerSchema);