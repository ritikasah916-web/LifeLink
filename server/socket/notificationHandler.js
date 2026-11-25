const jwt = require("jsonwebtoken");
const User = require("../models/User");

function initializeNotifications(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id role isActive");
      if (!user || user.role !== "donor" || !user.isActive) return next(new Error("Unauthorized"));
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });
  io.on("connection", socket => {
    socket.join(`donor-${socket.userId}`);
    socket.on("disconnect", () => {});
  });
}

module.exports = initializeNotifications;