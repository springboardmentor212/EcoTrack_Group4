const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  googleLogin,
  appleLogin,
} = require("../controllers/authController");

// Standard Auth Endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// OAuth Endpoints (Google & Apple)
router.post("/google", googleLogin);
router.post("/apple", appleLogin);

module.exports = router;