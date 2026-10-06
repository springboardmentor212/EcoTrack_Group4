const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, default: "" },
    picture: { type: String, default: "" },
    agreeTerms: { type: Boolean, default: true },

    // Gamification & Challenges
    ecoPoints: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    resetOTP: String,
    resetOTPExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);