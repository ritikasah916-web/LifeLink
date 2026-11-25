const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in to continue." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Authentication is not configured." });
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Your account is unavailable. Please contact support." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }
  next();
};

module.exports = { protect, authorizeRoles };