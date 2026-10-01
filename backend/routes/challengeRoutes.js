const express = require("express");
const router = express.Router();

const {
  getChallenges,
  createChallenge,
} = require("../controllers/challengeController");

router.get("/", getChallenges);
router.post("/", createChallenge);

module.exports = router;