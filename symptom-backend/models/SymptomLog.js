

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
      index: true,             
    },

    
    symptoms: {
      tags:       [String],      
      customText: String,         
    },

    
    aiResult: {
      conditions: [ConditionSchema],
      advice:     String,
      severity:   { type: String, enum: ["low", "moderate", "high"] },
      disclaimer: String,
    },

   
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SymptomLog", SymptomLogSchema);
