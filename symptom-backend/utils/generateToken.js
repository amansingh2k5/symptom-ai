/**
 * utils/generateToken.js
 * Creates a signed JWT for a user ID.
 * Token expires based on JWT_EXPIRE in .env (default: 7d)
 */

const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

module.exports = generateToken;
