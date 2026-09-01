const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 1. REGISTER USER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, agreeTerms } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      agreeTerms,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // JWT Secret from .env or unified fallback key
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "ecotrack_secret_key_123",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        ecoScore: user.ecoScore,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour validity

    await user.save();
    res.json({
      message: "Password reset request created successfully",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};