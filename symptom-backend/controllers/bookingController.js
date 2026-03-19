const Booking = require("../models/Booking");
const { sendBookingConfirmation } = require("../utils/emailService");

const createBooking = async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    const booking = await Booking.create({
      user: req.user._id,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      status: "confirmed",
    });

    
    const populatedBooking = await Booking.findById(booking._id).populate("doctor");

    sendBookingConfirmation(req.user, populatedBooking)
      .then(() => Booking.findByIdAndUpdate(booking._id, { emailSent: true }))
      .catch(err => console.error("Email send error:", err.message));

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ appointmentDate: 1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Already cancelled." });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled.", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };