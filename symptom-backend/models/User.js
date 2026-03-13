/**
 * models/User.js — MongoDB User Schema
 *
 * Stores account info, hashed passwords, and basic health profile.
 * Password is hashed via bcrypt BEFORE saving (pre-save hook below).
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,               // Never return password in queries by default
    },

    // Health profile — filled in on dashboard
    healthProfile: {
      age:            { type: Number },
      gender:         { type: String, enum: ["male", "female", "other"] },
      bloodGroup:     { type: String },
      allergies:      [String],
      existingConditions: [String],
    },

    // Email verification
    isVerified:        { type: Boolean, default: false },
    verifyToken:       String,
    verifyTokenExpiry: Date,

    // Password reset
    resetPasswordToken:  String,
    resetPasswordExpiry: Date,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }            // adds createdAt, updatedAt automatically
);

/**
 * Pre-save hook: hash password before every save.
 * Only runs if the password field was modified (e.g., not on profile updates).
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Salt rounds = 12: good balance of security and speed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Instance method: compare plain text password with hashed one.
 * Used during login.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
