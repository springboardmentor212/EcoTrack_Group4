const express = require("express");
const router = express.Router();

const {
  getGamificationData,
} = require("../controllers/gamificationController");

router.get("/", getGamificationData);

module.exports = router;