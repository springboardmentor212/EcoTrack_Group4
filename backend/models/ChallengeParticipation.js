const mongoose = require("mongoose");

const challengeParticipationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    challengeId: {
      type: String,
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["JOINED", "COMPLETED"],
      default: "JOINED",
    },
    progress: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

challengeParticipationSchema.index(
  { userId: 1, challengeId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.ChallengeParticipation ||
  mongoose.model("ChallengeParticipation", challengeParticipationSchema);