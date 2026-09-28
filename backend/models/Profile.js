const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    location: { type: String, default: "" },
    primaryTransport: { type: String, default: "" },
    memberSince: { type: String, default: "January 2024" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);