/**
 * routes/authRoutes.js
 */
const express    = require("express");
const { body }   = require("express-validator");
const rateLimit  = require("express-rate-limit");
const router     = express.Router();
const {
  register, login, verifyEmail,
  forgotPassword, resetPassword, getMe, updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Stricter rate limit for auth endpoints (5 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
});

// Input validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register",        authLimiter, registerValidation, register);
router.post("/login",           authLimiter, loginValidation,    login);
router.get( "/verify-email",                                     verifyEmail);
router.post("/forgot-password", authLimiter,                     forgotPassword);
router.post("/reset-password",                                   resetPassword);
router.get( "/me",              protect,                         getMe);
router.put( "/profile",         protect,                         updateProfile);

module.exports = router;
