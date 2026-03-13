/**
 * middleware/authMiddleware.js
 *
 * Protects routes by verifying the JWT in the Authorization header.
 * Usage: router.get("/profile", protect, controller)
 *
 * Expected header: Authorization: Bearer <token>
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Extract token from the Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
  }

  try {
    // Verify and decode the token — throws if expired or invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user object to req so controllers can use req.user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalid or expired. Please log in again." });
  }
};

/**
 * adminOnly — restrict route to admin role.
 * Always chain AFTER protect: router.get("/admin", protect, adminOnly, controller)
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
};

module.exports = { protect, adminOnly };
