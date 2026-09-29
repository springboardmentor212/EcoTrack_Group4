const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile"); // File name case-sensitive (Profile.js)
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    let profile = await Profile.findOne({ userId: String(userId) });

    if (!profile) {
      return res.status(200).json({
        location: "",
        primaryTransport: "",
        memberSince: "January 2024",
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/profile
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const { location, primaryTransport, memberSince } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: String(userId) },
      {
        userId: String(userId),
        location: location || "",
        primaryTransport: primaryTransport || "",
        memberSince: memberSince || "January 2024",
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    console.error("Save Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;