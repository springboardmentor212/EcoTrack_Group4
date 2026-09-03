const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // Google/Apple OAuth-kku password illama create aaga optional aakiyachu
    agreeTerms: { type: Boolean, default: true }, // Default true
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    location: { type: String, default: "" },
    ecoScore: { type: Number, default: 0 },
    badges: [{ type: String }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);