/**
 * routes/doctorRoutes.js
 */
const express = require("express");
const router  = express.Router();
const { getNearbyDoctors, getDoctorDetails } = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");

router.get("/nearby",   protect, getNearbyDoctors);
router.get("/:placeId", protect, getDoctorDetails);

module.exports = router;
