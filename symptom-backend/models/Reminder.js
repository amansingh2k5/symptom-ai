/**
 * models/Reminder.js — Medication reminders.
 * node-cron checks this collection every minute and sends emails.
 */

const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicationName: { type: String, required: true },
    dosage:         { type: String, required: true },   // e.g. "500mg"

    // Schedule: array of times like ["08:00", "14:00", "20:00"]
    times: {
      type: [String],
      required: true,
    },

    isActive: { type: Boolean, default: true },

    // Track last sent to avoid double-sending
    lastSentAt: Date,

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", ReminderSchema);
