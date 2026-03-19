

const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicationName: { type: String, required: true },
    dosage:         { type: String, required: true },  

 
    times: {
      type: [String],
      required: true,
    },

    isActive: { type: Boolean, default: true },

   
    lastSentAt: Date,

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", ReminderSchema);
