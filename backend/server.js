const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// DNS Setup
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Auto Seed Function Import
const seedChallenges = require("./seedChallenges");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const trackerRoutes = require("./routes/trackerRoutes");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reportRoutes = require("./routes/reportRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Admin Routes Import
const adminRoutes = require("./routes/adminRoutes"); // Matches AdminRoutes.js filename case

const app = express();

// Middlewares - Support large image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Base Health Check
app.get("/", (req, res) => {
  res.send("EcoTrack Backend API is running!");
});

// API Routes Mapping
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);

if (goalRoutes) {
  app.use("/api/goals", goalRoutes);
}

app.use("/api/profile", profileRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Dashboard Route Binding
app.use("/api/dashboard", dashboardRoutes);

// Admin Route Binding (/api/admin)
app.use("/api/admin", adminRoutes);

// 404 Fallback Route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// MongoDB Connection & Server Launch
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecotrack";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully!");
    
    // Auto populate 40 Challenges
    try {
      await seedChallenges();
    } catch (seedErr) {
      console.error("Seeding Error:", seedErr.message);
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Database Connection Error:", err.message));