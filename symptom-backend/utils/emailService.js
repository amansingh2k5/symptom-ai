/**
 * utils/emailService.js — Nodemailer email sender
 *
 * Uses Gmail as the SMTP transport.
 * All emails use HTML templates defined below.
 *
 * Setup:
 *   1. Enable 2FA on your Gmail account
 *   2. Generate an "App Password" at myaccount.google.com/apppasswords
 *   3. Set EMAIL_USER and EMAIL_PASS in .env
 */

const nodemailer = require("nodemailer");

// Create a reusable transporter instance
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // App Password, NOT your Gmail login password
  },
});

// ── Shared HTML wrapper for branded emails ────────────────────────────────────
const htmlWrapper = (content) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #6366f1; padding: 24px 32px; display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">🩺</span>
      <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">SymptomAI</span>
    </div>
    <!-- Body -->
    <div style="padding: 32px; color: #f1f5f9;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding: 16px 32px; background: #1e293b; color: #64748b; font-size: 12px; text-align: center;">
      ⚠️ Not a substitute for professional medical advice. Always consult a doctor.<br/>
      © ${new Date().getFullYear()} SymptomAI
    </div>
  </div>
`;

// ── 1. Welcome / Email Verification ─────────────────────────────────────────
const sendVerificationEmail = async (user, verifyUrl) => {
  const html = htmlWrapper(`
    <h2 style="margin: 0 0 8px; color: #6366f1;">Verify your email</h2>
    <p style="color: #94a3b8;">Hi <strong style="color: #f1f5f9;">${user.name}</strong>, welcome to SymptomAI!</p>
    <p style="color: #94a3b8; margin-bottom: 24px;">Click the button below to verify your email address and activate your account.</p>
    <a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600;">
      Verify Email
    </a>
    <p style="margin-top: 20px; color: #64748b; font-size: 13px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your SymptomAI account",
    html,
  });
};

// ── 2. Booking Confirmation ───────────────────────────────────────────────────
const sendBookingConfirmation = async (user, booking) => {
  const dateStr = new Date(booking.appointmentDate).toDateString();

  const html = htmlWrapper(`
    <h2 style="margin: 0 0 8px; color: #10b981;">Appointment Confirmed ✓</h2>
    <p style="color: #94a3b8;">Hi <strong style="color: #f1f5f9;">${user.name}</strong>, your appointment has been booked.</p>

    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;">
      <table style="width: 100%; border-collapse: collapse; color: #94a3b8; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #64748b;">Doctor</td>     <td style="color: #f1f5f9; font-weight: 600;">${booking.doctor.name}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Specialty</td>  <td style="color: #f1f5f9;">${booking.doctor.specialty}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Hospital</td>   <td style="color: #f1f5f9;">${booking.doctor.hospital}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Date</td>       <td style="color: #f1f5f9;">${dateStr}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Time</td>       <td style="color: #f1f5f9;">${booking.appointmentTime}</td></tr>
        ${booking.reason ? `<tr><td style="padding: 6px 0; color: #64748b;">Reason</td><td style="color: #f1f5f9;">${booking.reason}</td></tr>` : ""}
      </table>
    </div>

    <p style="color: #94a3b8; font-size: 13px;">Please arrive 10 minutes early. Bring any previous medical reports if available.</p>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Appointment with ${booking.doctor.name} confirmed`,
    html,
  });
};

// ── 3. Medication Reminder ────────────────────────────────────────────────────
const sendMedicationReminder = async (user, reminder) => {
  const html = htmlWrapper(`
    <h2 style="margin: 0 0 8px; color: #f59e0b;">💊 Medication Reminder</h2>
    <p style="color: #94a3b8;">Hi <strong style="color: #f1f5f9;">${user.name}</strong>, time to take your medication!</p>

    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 20px; font-weight: 700; color: #f1f5f9;">${reminder.medicationName}</p>
      <p style="margin: 6px 0 0; color: #94a3b8;">Dosage: <strong style="color: #f1f5f9;">${reminder.dosage}</strong></p>
      ${reminder.notes ? `<p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">${reminder.notes}</p>` : ""}
    </div>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `💊 Time to take ${reminder.medicationName}`,
    html,
  });
};

// ── 4. Password Reset ─────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = htmlWrapper(`
    <h2 style="margin: 0 0 8px; color: #ef4444;">Reset your password</h2>
    <p style="color: #94a3b8;">Hi <strong style="color: #f1f5f9;">${user.name}</strong>, we received a password reset request.</p>
    <p style="color: #94a3b8; margin-bottom: 24px;">Click the button below to set a new password. This link is valid for 1 hour.</p>
    <a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600;">
      Reset Password
    </a>
    <p style="margin-top: 20px; color: #64748b; font-size: 13px;">If you didn't request this, ignore this email — your password will remain unchanged.</p>
  `);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your SymptomAI password",
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendBookingConfirmation,
  sendMedicationReminder,
  sendPasswordResetEmail,
};
