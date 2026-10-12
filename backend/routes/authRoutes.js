const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

// User Model import
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "ecotrack_jwt_secret_key_123";

// OTP temporary memory storage
const otpStore = {};

// Transporter Configuration for Sending Emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ----------------------------------------------------
// 1. STANDARD REGISTER (/api/auth/register)
// ----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    user = new User({
      fullName: fullName || email.split("@")[0],
      email,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture || "",
      },
      message: "Registration successful!",
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ----------------------------------------------------
// 2. STANDARD LOGIN (/api/auth/login)
// ----------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found with this email." });
    }

    if (user.password && user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture || "",
      },
      message: "Login successful!",
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ----------------------------------------------------
// 3. GOOGLE LOGIN (/api/auth/google)
// ----------------------------------------------------
router.post("/google", async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for Google login." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        fullName: name || email.split("@")[0],
        email: email,
        picture: picture || "",
        googleId: googleId || "",
      });
      await user.save();
    } else {
      if (picture && !user.picture) {
        user.picture = picture;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture || picture || "",
      },
      message: "Google login successful!",
    });
  } catch (err) {
    console.error("Google Auth Backend Error:", err);
    return res.status(500).json({
      message: "Google authentication failed on server.",
      error: err.message,
    });
  }
});

// ----------------------------------------------------
// 4. GET CURRENT USER PROFILE (/api/auth/me)
// ----------------------------------------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        picture: user.picture || "",
      },
    });
  } catch (err) {
    console.error("Auth /me error:", err);
    res.status(500).json({ message: "Server error fetching user details." });
  }
});

// ----------------------------------------------------
// 5. FORGOT PASSWORD - SEND OTP (/api/auth/forgot-password)
// ----------------------------------------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: `"EcoTrack" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "EcoTrack - Password Reset OTP",
        html: `<h3>Your OTP for password reset is: <b>${generatedOtp}</b></h3>
               <p>This OTP is valid for 10 minutes.</p>`,
      };
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE] OTP generated for ${email}: ${generatedOtp}`);
    }

    res.json({ message: "OTP sent successfully to your email!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

// ----------------------------------------------------
// 6. VERIFY OTP (/api/auth/verify-otp)
// ----------------------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "No OTP request found for this email." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== otp?.trim()) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    res.json({ message: "OTP verified successfully!" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Verification failed." });
  }
});

// ----------------------------------------------------
// 7. RESET PASSWORD VIA OTP (/api/auth/reset-password-otp)
// ----------------------------------------------------
router.post("/reset-password-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[email];

    if (!record || record.otp !== otp?.trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP session." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    delete otpStore[email];

    res.json({ message: "Password updated successfully! Redirecting to login..." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Failed to reset password." });
  }
});

// ----------------------------------------------------
// 8. CHANGE PASSWORD IN SETTINGS (/api/auth/change-password)
// ----------------------------------------------------
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.password && user.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to change password." });
  }
});

module.exports = router;