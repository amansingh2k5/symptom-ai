/**
 * server.js — Main entry point for SymptomAI Backend
 *
 * Starts Express, connects MongoDB, registers all routes,
 * and boots the medication reminder cron job.
 */

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const rateLimit  = require("express-rate-limit");

// Load .env variables FIRST before importing anything that needs them
dotenv.config();

const authRoutes     = require("./routes/authRoutes");
const symptomRoutes  = require("./routes/symptomRoutes");
const doctorRoutes   = require("./routes/doctorRoutes");
const bookingRoutes  = require("./routes/bookingRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

// Start medication cron job (runs independently in background)
require("./utils/cronJobs");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from your React frontend
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,                // allow cookies / auth headers
}));

app.use(express.json());            // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * Global rate limiter — prevents brute force attacks.
 * 100 requests per 15 minutes per IP address.
 * Individual routes (like login) have stricter limits.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/symptoms",  symptomRoutes);
app.use("/api/doctors",   doctorRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api/reminders", reminderRoutes);

// Health check endpoint (useful for Render / Railway deployment)
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SymptomAI API is running 🚀", env: process.env.NODE_ENV });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler — catches any unhandled errors in routes/controllers
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Database + Server Boot ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);               // exit process so hosting platform can restart
  });
