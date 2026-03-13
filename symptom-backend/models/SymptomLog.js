/**
 * models/SymptomLog.js — Stores each AI symptom check result per user.
 * Referenced in History view on the frontend.
 */

const mongoose = require("mongoose");

const ConditionSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  probability: { type: String, enum: ["High", "Moderate", "Low"] },
  specialist:  { type: String },
}, { _id: false });

const SymptomLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,               // index for fast per-user queries
    },

    // Symptoms submitted by user
    symptoms: {
      tags:       [String],       // from tag picker: ["Fever", "Headache"]
      customText: String,         // free-text description
    },

    // AI analysis result
    aiResult: {
      conditions: [ConditionSchema],
      advice:     String,
      severity:   { type: String, enum: ["low", "moderate", "high"] },
      disclaimer: String,
    },

    // Tokens used (for cost tracking if needed)
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SymptomLog", SymptomLogSchema);
