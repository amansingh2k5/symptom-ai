/**
 * controllers/symptomController.js
 *
 * Connects to OpenAI API to analyze symptoms,
 * saves the result to MongoDB, returns structured JSON to frontend.
 */

const OpenAI = require("openai");
const SymptomLog = require("../models/SymptomLog");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Check Symptoms via OpenAI ─────────────────────────────────────────────
const checkSymptoms = async (req, res) => {
  try {
    const { tags = [], customText = "" } = req.body;

    if (!tags.length && !customText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one symptom.",
      });
    }

    const symptomList = [...tags, customText].filter(Boolean).join(", ");

    const systemPrompt = `
You are a medical triage assistant.

Given a list of symptoms, analyze possible causes and return ONLY a valid JSON object (no markdown or explanation).

JSON structure:
{
  "severity": "low | moderate | high",

  "conditions": [
    {
      "name": "condition name",
      "probability": "High | Moderate | Low",
      "specialist": "doctor type",
      "description": "short explanation"
    }
  ],

  "medications": [
    {
      "name": "OTC medicine name",
      "usage": "what symptom it helps with",
      "note": "short safe usage note"
    }
  ],

  "homeRemedies": [
    "remedy 1",
    "remedy 2",
    "remedy 3"
  ],

  "precautions": [
    "precaution 1",
    "precaution 2"
  ],

  "seeDoctorIf": [
    "warning sign 1",
    "warning sign 2"
  ],

  "disclaimer": "Not a substitute for professional medical advice."
}

Rules:
- Suggest ONLY over-the-counter medicines
- Never prescribe antibiotics or prescription drugs
- Provide 2–4 possible conditions
- Keep explanations short and simple
- Always return valid JSON
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Symptoms: ${symptomList}` },
      ],
      temperature: 0.3,
      max_tokens: 700,
    });

    const rawText = completion.choices[0].message.content;
    let aiResult;

    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      aiResult = JSON.parse(clean);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned an unexpected format. Please try again.",
      });
    }

    const log = await SymptomLog.create({
      user: req.user._id,
      symptoms: { tags, customText },
      aiResult,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

    res.json({
      success: true,
      result: aiResult,
      logId: log._id,
    });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "OpenAI rate limit reached. Please wait a moment.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Symptom History ─────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SymptomLog.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-tokensUsed"),
      SymptomLog.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Delete a Symptom Log ────────────────────────────────────────────────────
const deleteLog = async (req, res) => {
  try {
    const log = await SymptomLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found.",
      });
    }

    await log.deleteOne();

    res.json({
      success: true,
      message: "Log deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkSymptoms,
  getHistory,
  deleteLog,
};