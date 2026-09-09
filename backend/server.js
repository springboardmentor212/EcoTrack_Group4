const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
require("dotenv").config();

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
app.use(express.json());

// CORS 
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health Check Route
app.get("/", (req, res) => {
  res.send("EcoTrack Backend API is running successfully!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecotrack";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
  });