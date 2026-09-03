const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");

// 1. Register User (With Password Hashing)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, agreeTerms } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password Hashing for Security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      agreeTerms: agreeTerms !== undefined ? agreeTerms : true,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error in Terminal:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// 2. Login User (With Hashed Password Comparison)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Hash Compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error in Terminal:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 3. Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    res.json({ message: "Password reset link sent if email exists." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Google Login
exports.googleLogin = async (req, res) => {
  const { access_token } = req.body;
  try {
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
    );
    const { email, name } = googleRes.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: name,
        email,
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
    console.error("Google Auth Error in Terminal:", error);
    res.status(500).json({ message: "Google authentication failed on server." });
  }
};

// 5. Apple Login
exports.appleLogin = async (req, res) => {
  const { user } = req.body;
  try {
    const email = user?.email || "apple_user@ecotrack.com";
    let dbUser = await User.findOne({ email });

    if (!dbUser) {
      dbUser = await User.create({
        fullName: user?.name
          ? `${user.name.firstName} ${user.name.lastName}`
          : "Apple User",
        email: email,
        agreeTerms: true,
      });
    }

    const token = jwt.sign(
      { id: dbUser._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: dbUser._id, fullName: dbUser.fullName, email: dbUser.email },
    });
  } catch (error) {
    console.error("Apple Auth Error in Terminal:", error);
    res.status(500).json({ message: "Apple authentication failed on server." });
  }
};