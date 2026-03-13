/**
 * controllers/reminderController.js
 * CRUD for medication reminders. The cron job in utils/cronJobs.js
 * reads these reminders and sends emails automatically.
 */

const Reminder = require("../models/Reminder");

// POST /api/reminders  (protected)
const createReminder = async (req, res) => {
  try {
    const { medicationName, dosage, times, notes } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      medicationName,
      dosage,
      times,      // ["08:00", "20:00"]
      notes,
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reminders  (protected)
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/reminders/:id  (protected) — toggle active, update times, etc.
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reminders/:id  (protected)
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });
    res.json({ success: true, message: "Reminder deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReminder, getReminders, updateReminder, deleteReminder };
