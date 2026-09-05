const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPasswordWithOTP,
  googleLogin,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password-otp", resetPasswordWithOTP);
router.post("/google-login", googleLogin);

module.exports = router;