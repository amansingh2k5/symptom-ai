
const Reminder = require("../models/Reminder");


const createReminder = async (req, res) => {
  try {
    const { medicationName, dosage, times, notes } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      medicationName,
      dosage,
      times,     
      notes,
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


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
