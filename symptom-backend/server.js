/**
 * server.js — Main entry point for SymptomAI Backend
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

// start medication reminder cron job
require("./utils/cronJobs");

const app = express();


// ─────────────────────────────────────────────
// CORS (FIXED FOR VERCEL + LOCALHOST)
// ─────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://symptom-ai.vercel.app",
  "https://symptom-aiamansingh.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);


// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ─────────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────────

// Global limiter — increased to handle cold-start burst requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                  // increased from 100 to 300
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again later."
  }
});

// Auth-specific limiter — stricter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
});

app.use(globalLimiter);


// ─────────────────────────────────────────────
// Root + Health Check (for Render keep-alive)
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SymptomAI API is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SymptomAI API is running 🚀",
    env: process.env.NODE_ENV
  });
});


// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use("/api/auth", authLimiter, authRoutes);  // auth has its own stricter limiter
app.use("/api/symptoms", symptomRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reminders", reminderRoutes);


// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


// ─────────────────────────────────────────────
// Database + Server
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });