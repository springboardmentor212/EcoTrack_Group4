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

// Google Authentication Routes (Both endpoints mapped to handle frontend requests)
router.post("/google-login", googleLogin);
router.post("/google", googleLogin); 

module.exports = router;