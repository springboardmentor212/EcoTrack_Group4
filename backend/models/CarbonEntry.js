const mongoose = require("mongoose");

const carbonEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["Transport", "Energy", "Food", "Waste", "Water Usage"],
      required: true,
    },
    subCategory: { type: String, required: true }, // e.g., "Gasoline Car", "Electricity Usage"
    value: { type: Number, required: true }, // e.g., 45.5 (km or kWh)
    carbonEmitted: { type: Number, required: true }, // in kg CO2e
    passengers: { type: Number, default: 1 },
    activityDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarbonEntry", carbonEntrySchema);