/**
 * utils/cronJobs.js — Medication Reminder Cron Job
 *
 * Uses node-cron to run a job every minute.
 * Checks for active reminders scheduled at the current HH:MM,
 * skips ones already sent in the last 55 minutes (avoids double-send),
 * then fires reminder emails via Nodemailer.
 *
 * Cron syntax:  * * * * *
 *               │ │ │ │ └── day of week (0-7)
 *               │ │ │ └──── month (1-12)
 *               │ │ └────── day of month (1-31)
 *               │ └──────── hour (0-23)
 *               └────────── minute (0-59)
 */

const cron     = require("node-cron");
const Reminder = require("../models/Reminder");
const User     = require("../models/User");
const { sendMedicationReminder } = require("./emailService");

// Run every minute: "* * * * *"
cron.schedule("* * * * *", async () => {
  try {
    // Get current HH:MM in 24h format e.g. "08:00", "14:30"
    const now    = new Date();
    const hours  = String(now.getHours()).padStart(2, "0");
    const mins   = String(now.getMinutes()).padStart(2, "0");
    const timeNow = `${hours}:${mins}`;

    // Find active reminders that include the current time
    const reminders = await Reminder.find({
      isActive: true,
      times: timeNow,
    });

    for (const reminder of reminders) {
      // Skip if already sent in the last 55 minutes (prevents duplicate sends)
      if (reminder.lastSentAt) {
        const msSinceLastSent = now - new Date(reminder.lastSentAt);
        if (msSinceLastSent < 55 * 60 * 1000) continue;
      }

      // Fetch the user's email
      const user = await User.findById(reminder.user);
      if (!user) continue;

      // Send the reminder email
      await sendMedicationReminder(user, reminder);

      // Update lastSentAt to prevent duplicate sends
      await Reminder.findByIdAndUpdate(reminder._id, { lastSentAt: now });

      console.log(`📧 Reminder sent to ${user.email} for ${reminder.medicationName}`);
    }
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});

console.log("⏰ Medication reminder cron job started");
