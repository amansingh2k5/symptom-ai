/**
 * controllers/authController.js
 *
 * Handles: Register, Login, Email Verification, Forgot/Reset Password
 */

const crypto        = require("crypto");
const User          = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

// ── Register ──────────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already registered
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    // Generate a random 6-char hex token for email verification
    const verifyToken  = crypto.randomBytes(20).toString("hex");
    const tokenExpiry  = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,                      // hashed by pre-save hook in User model
      verifyToken,
      verifyTokenExpiry: tokenExpiry,
    });

    // Build the verification URL that the user will click in their email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user, verifyUrl);

    res.status(201).json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default via `select: false`)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Use a generic message — don't reveal whether email exists
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        healthProfile: user.healthProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Verify Email ──────────────────────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },  // token must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }

    // Mark as verified and clean up the token fields
    user.isVerified          = true;
    user.verifyToken         = undefined;
    user.verifyTokenExpiry   = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified! You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond success to prevent email enumeration attacks
    if (!user) {
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken  = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken  = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;   // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user, resetUrl);

    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken:  token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
    }

    user.password            = newPassword;   // pre-save hook re-hashes it
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── Update Health Profile ─────────────────────────────────────────────────────
// PUT /api/auth/profile  (protected)
const updateProfile = async (req, res) => {
  try {
    const { name, healthProfile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, healthProfile },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe, updateProfile };
