const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const axios = require("axios");

// Nodemailer Config
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Register
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, agreeTerms } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });
    if (user) return res.status(400).json({ message: "User already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    user = new User({
      fullName: fullName ? fullName.trim() : "",
      email: cleanEmail,
      password: hashedPassword,
      agreeTerms: agreeTerms !== undefined ? agreeTerms : true,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// 2. Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist. Please register first!" });
    }

    if (!user.password) {
      return res.status(400).json({ 
        message: "This account was created with Google. Please use 'Sign in with Google'." 
      });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password. Please try again." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// 3. Forgot Password - Generate & Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter your email." });

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User with this email does not exist." });

    // 6-Digit Random OTP Generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // Valid for 10 Minutes

    await user.save();

    const mailOptions = {
      from: `"EcoTrack Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "EcoTrack - Password Reset Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1b7a42;">EcoTrack Password Reset</h2>
          <p style="font-size: 14px; color: #333;">Your One-Time Password (OTP) code is:</p>
          <h1 style="color: #1b7a42; letter-spacing: 6px; font-size: 36px; margin: 15px 0;">${otp}</h1>
          <p style="font-size: 12px; color: #666;">This OTP is valid for 10 minutes only.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending OTP email." });
  }
};

// 4. Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: cleanEmail,
      resetOTP: otp.trim(),
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP code!" });
    }

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

// 5. Reset Password with OTP
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: cleanEmail,
      resetOTP: otp.trim(),
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Session expired or invalid OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword.trim(), salt);

    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password updated successfully! Redirecting to login..." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error resetting password." });
  }
};

// 6. Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Access token is missing" });
    }

    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name } = googleRes.data;
    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        fullName: name || "Google User",
        email: cleanEmail,
        agreeTerms: true,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Google Login Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Google authentication failed." });
  }
};