const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { connectDb } = require("./lib/db");
const { notFound, errorHandler } = require("./middleware/errors");
const authRoutes = require("./routes/auth");

const app = express();

// Trust reverse proxy in production (Render, Heroku, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ── Security: Helmet (HTTP headers) ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ── Security: CORS ────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// ── Security: Rate limiting ───────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit on auth endpoints to prevent brute force
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please wait 15 minutes." }
});

app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authLimiter, authRoutes);

app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDb(process.env.MONGO_URI);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port} [${process.env.NODE_ENV || "development"}]`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
