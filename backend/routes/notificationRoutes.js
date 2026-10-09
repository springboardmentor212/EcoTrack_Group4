const express = require("express");
const router = express.Router();
let Notification;
try {
  Notification = require("../models/Notification");
} catch (e) {}

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id || req.userId || req.query.userId || "guest";
    const currentUserId = String(rawUserId);

    if (!Notification) return res.status(200).json([]);

    const notifications = await Notification.find({
      $or: [{ userId: currentUserId }, { userId: "guest" }, { userId: { $exists: false } }]
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
});

module.exports = router;