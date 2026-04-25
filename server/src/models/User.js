const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    verifyEmailTokenHash: { type: String, default: null },
    verifyEmailTokenExpiresAt: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordTokenExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

