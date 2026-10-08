const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["JOINED", "IN_PROGRESS", "COMPLETED"],
      default: "JOINED",
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

participationSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model("Participation", participationSchema);