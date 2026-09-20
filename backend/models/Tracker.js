const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest",
    },
    category: {
      type: String,
      default: "General",
    },
    subType: {
      type: String,
      default: "",
    },
    value: {
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