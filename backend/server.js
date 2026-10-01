const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


// Route Imports

const dns =require("dns");
dns.setServers(["1.1.1.1" , "8.8.8.8"]);

// Routes Imports

const authRoutes = require("./routes/authRoutes");
const trackerRoutes = require("./routes/trackerRoutes");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
 // <-- ADD THIS LINE
const recommendationRoutes = require("./routes/recommendationRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");



const app = express();

// Middlewares
app.use(express.json());
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);
if (goalRoutes) {
  app.use("/api/goals", goalRoutes);
}
app.use("/api/profile", profileRoutes);

app.use("/api/recommendations", recommendationRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// MongoDB Connection & Server Launch
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecotrack";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Database Connection Error:", err.message));