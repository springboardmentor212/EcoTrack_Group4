const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const Profile = require("../models/Profile");
const User = require("../models/User");

// 1. Get Profile Details (/api/profile)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id).select("-password");

    if (!profile) {
      // Default empty profile fallback
      profile = {
        location: "",
        primaryTransport: "",
        avatar: user?.picture || "",
        notifications: {
          dailyReminder: true,
          weeklyReport: true,
          goalAchievement: true,
          challengeUpdates: false,
        },
      };
    }

    res.json({
      name: user?.name || user?.fullName || "User",
      email: user?.email || "",
      avatar: profile.avatar || user?.picture || "",
      location: profile.location || "",
      primaryTransport: profile.primaryTransport || "",
      notifications: profile.notifications || {},
    });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Save / Update Profile Details - PUT (/api/profile)
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { name, avatar, location, primaryTransport, notifications } = req.body;

    // Update User Name if sent
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name, fullName: name });
    }

    // Update or Create Profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        avatar,
        location,
        primaryTransport,
        notifications,
      });
    } else {
      if (avatar !== undefined) profile.avatar = avatar;
      if (location !== undefined) profile.location = location;
      if (primaryTransport !== undefined) profile.primaryTransport = primaryTransport;
      if (notifications !== undefined) profile.notifications = notifications;
    }

    await profile.save();
    res.json({ message: "Settings sariyagi save agide!", profile });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Settings save madalu agilla" });
  }
});

// 3. Fallback POST (/api/profile)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { location, primaryTransport, name, avatar, notifications } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        location,
        primaryTransport,
        avatar,
        notifications,
      });
    } else {
      if (location) profile.location = location;
      if (primaryTransport) profile.primaryTransport = primaryTransport;
      if (avatar) profile.avatar = avatar;
      if (notifications) profile.notifications = notifications;
    }

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name, fullName: name });
    }

    await profile.save();
    res.json({ message: "Profile update agide!", profile });
  } catch (err) {
    console.error("POST Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Delete Account (/api/profile)
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account delete agide!" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;