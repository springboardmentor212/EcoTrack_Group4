const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: String, 
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      default: "",
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