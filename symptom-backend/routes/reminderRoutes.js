
const express = require("express");
const router  = express.Router();
const { createReminder, getReminders, updateReminder, deleteReminder } = require("../controllers/reminderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",      protect, createReminder);
router.get( "/",      protect, getReminders);
router.patch("/:id",  protect, updateReminder);
router.delete("/:id", protect, deleteReminder);

module.exports = router;
