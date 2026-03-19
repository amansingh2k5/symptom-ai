
const express = require("express");
const router  = express.Router();
const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",              protect, createBooking);
router.get( "/",              protect, getMyBookings);
router.patch("/:id/cancel",   protect, cancelBooking);

module.exports = router;
