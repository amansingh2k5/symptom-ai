/**
 * models/Booking.js — Doctor appointment booking.
 * When a booking is created, a confirmation email is sent via Nodemailer.
 */

const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Doctor info (from Google Maps Places or your own DB)
    doctor: {
      placeId:   String,           // Google Maps Place ID
      name:      { type: String, required: true },
      specialty: String,
      hospital:  String,
      address:   String,
      phone:     String,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,                // e.g. "10:30 AM"
      required: true,
    },

    reason: String,                // brief description from user

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // Track if confirmation email was sent
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
