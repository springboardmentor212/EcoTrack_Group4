const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String 
    },
    googleId: { 
      type: String, 
      default: "" 
    }, 
    agreeTerms: { 
      type: Boolean, 
      default: true 
    },
    resetOTP: String,
    resetOTPExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);