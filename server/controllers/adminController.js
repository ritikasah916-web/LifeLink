const User = require("../models/User");
const Donor = require("../models/Donor");
const Request = require("../models/Request");
const Response = require("../models/Response");

async function getAdminStats(req, res) {
  const [
    totalUsers, totalDonors, availableDonors, totalHospitals, totalAdmins,
    totalRequests, pendingRequests, fulfilledRequests, cancelledRequests,
    acceptedResponses, declinedResponses, bloodGroupStats, recentRequests
  ] = await Promise.all([
    User.countDocuments(), User.countDocuments({ role: "donor" }),
    Donor.countDocuments({ isAvailable: true }), User.countDocuments({ role: "hospital" }),
    User.countDocuments({ role: "admin" }), Request.countDocuments(),
    Request.countDocuments({ status: "pending" }), Request.countDocuments({ status: "fulfilled" }),
    Request.countDocuments({ status: "cancelled" }), Response.countDocuments({ status: "accepted" }),
    Response.countDocuments({ status: "declined" }),
    Donor.aggregate([{ $group: { _id: "$bloodGroup", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Request.find().populate("hospital", "name").sort({ createdAt: -1 }).limit(8).lean()
  ]);
  return res.json({
    statistics: { totalUsers, totalDonors, availableDonors, totalHospitals, totalAdmins,
      totalRequests, pendingRequests, fulfilledRequests, cancelledRequests, acceptedResponses, declinedResponses },
    bloodGroupStats, recentRequests
  });
}

async function getAdminUsers(req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).limit(200).lean();
  const donorIds = users.filter(u => u.role === "donor").map(u => u._id);
  const donors = await Donor.find({ user: { $in: donorIds } }).lean();
  const donorMap = new Map(donors.map(d => [String(d.user), d]));
  return res.json({ users: users.map(u => ({ ...u, donorProfile: donorMap.get(String(u._id)) || null })) });
}

async function updateUserStatus(req, res) {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: "You cannot deactivate your own account." });
  const { isActive } = req.body || {};
  if (typeof isActive !== "boolean") return res.status(400).json({ message: "isActive must be true or false." });
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ message: `Account ${isActive ? "activated" : "deactivated"}.`, user });
}

async function getAdminRequests(req, res) {
  const requests = await Request.find().populate("hospital", "name email").sort({ createdAt: -1 }).limit(250).lean();
  return res.json({ requests });
}

async function updateRequestStatus(req, res) {
  const { status } = req.body || {};
  if (!["pending", "fulfilled", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid request status." });
  const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!request) return res.status(404).json({ message: "Request not found." });
  return res.json({ message: "Request status updated.", request });
}

module.exports = { getAdminStats, getAdminUsers, updateUserStatus, getAdminRequests, updateRequestStatus };