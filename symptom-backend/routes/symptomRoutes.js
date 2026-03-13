/**
 * routes/symptomRoutes.js
 */
const express = require("express");
const router  = express.Router();
const { checkSymptoms, getHistory, deleteLog } = require("../controllers/symptomController");
const { protect } = require("../middleware/authMiddleware");

// All symptom routes require authentication
router.post("/check",       protect, checkSymptoms);
router.get( "/history",     protect, getHistory);
router.delete("/:id",       protect, deleteLog);

module.exports = router;
