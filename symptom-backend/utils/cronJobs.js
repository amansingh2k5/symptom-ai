

const cron     = require("node-cron");
const Reminder = require("../models/Reminder");
const User     = require("../models/User");
const { sendMedicationReminder } = require("./emailService");

cron.schedule("* * * * *", async () => {
  try {
    
    const now    = new Date();
    const hours  = String(now.getHours()).padStart(2, "0");
    const mins   = String(now.getMinutes()).padStart(2, "0");
    const timeNow = `${hours}:${mins}`;

    const reminders = await Reminder.find({
      isActive: true,
      times: timeNow,
    });

    for (const reminder of reminders) {
      
      if (reminder.lastSentAt) {
        const msSinceLastSent = now - new Date(reminder.lastSentAt);
        if (msSinceLastSent < 55 * 60 * 1000) continue;
      }

      const user = await User.findById(reminder.user);
      if (!user) continue;

      
      await sendMedicationReminder(user, reminder);

      
      await Reminder.findByIdAndUpdate(reminder._id, { lastSentAt: now });

      console.log(`📧 Reminder sent to ${user.email} for ${reminder.medicationName}`);
    }
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});

console.log("⏰ Medication reminder cron job started");
