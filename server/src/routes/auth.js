const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const User = require("../models/User");
const { randomToken, sha256Hex } = require("../lib/tokens");
const { sendMail } = require("../lib/mail");

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign({ sub: userId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(60),
      email: z.string().email(),
      password: z.string().min(8).max(128)
    });
    const { name, email, password } = schema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);

    const token = randomToken();
    const tokenHash = sha256Hex(token);
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    const user = await User.create({
      name,
      email,
      passwordHash,
      verifyEmailTokenHash: tokenHash,
      verifyEmailTokenExpiresAt: expires
    });

    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    try {
      await sendMail({
        to: email,
        subject: "Verify your email",
        text: `Verify your email: ${verifyUrl}`,
        html: `<p>Verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
      });
    } catch (e) {
      // If SMTP not configured yet, allow account creation (user asked to provide keys later)
    }

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, emailVerified: Boolean(user.emailVerifiedAt) }
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });
    const { email, password } = schema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(String(user._id));

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, emailVerified: Boolean(user.emailVerifiedAt) }
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      token: z.string().min(10)
    });
    const { email, token } = schema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid token" });

    if (user.emailVerifiedAt) return res.json({ ok: true });

    const tokenHash = sha256Hex(token);
    const isMatch = user.verifyEmailTokenHash && user.verifyEmailTokenHash === tokenHash;
    const notExpired = user.verifyEmailTokenExpiresAt && user.verifyEmailTokenExpiresAt.getTime() > Date.now();

    if (!isMatch || !notExpired) return res.status(400).json({ error: "Invalid token" });

    user.emailVerifiedAt = new Date();
    user.verifyEmailTokenHash = null;
    user.verifyEmailTokenExpiresAt = null;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(req.body);

    const user = await User.findOne({ email });
    // Always respond OK to avoid user enumeration
    if (!user) return res.json({ ok: true });

    const token = randomToken();
    user.resetPasswordTokenHash = sha256Hex(token);
    user.resetPasswordTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    await sendMail({
      to: email,
      subject: "Reset your password",
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      token: z.string().min(10),
      newPassword: z.string().min(8).max(128)
    });
    const { email, token, newPassword } = schema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid token" });

    const tokenHash = sha256Hex(token);
    const isMatch = user.resetPasswordTokenHash && user.resetPasswordTokenHash === tokenHash;
    const notExpired = user.resetPasswordTokenExpiresAt && user.resetPasswordTokenExpiresAt.getTime() > Date.now();

    if (!isMatch || !notExpired) return res.status(400).json({ error: "Invalid token" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordTokenHash = null;
    user.resetPasswordTokenExpiresAt = null;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

