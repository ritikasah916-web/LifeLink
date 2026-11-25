const mongoose = require("mongoose");
const Response = require("../models/Response");
const Request = require("../models/Request");
const Donor = require("../models/Donor");
const { isDonorPreliminarilyEligible } = require("../services/donorMatchingService");

async function respondToRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body || {};
    if (!mongoose.isValidObjectId(requestId)) return res.status(400).json({ message: "Invalid request ID." });
    if (!["accepted", "declined"].includes(status)) return res.status(400).json({ message: "Choose accept or decline." });
    const request = await Request.findById(requestId);
    if (!request || request.status !== "pending" || request.requiredBy <= new Date()) {
      return res.status(404).json({ message: "This blood request is no longer active." });
    }
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor || !donor.isAvailable || !isDonorPreliminarilyEligible(donor)) {
      return res.status(403).json({ message: "Your donor profile is not currently available for matching." });
    }
    if (donor.bloodGroup !== request.bloodGroup || donor.city.trim().toLowerCase() !== request.city.trim().toLowerCase()) {
      return res.status(403).json({ message: "This request does not match your donor profile." });
    }
    const response = await Response.create({ request: request._id, donor: req.user._id, status });
    return res.status(201).json({ message: `You ${status} this request.`, response });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already responded to this request." });
    console.error("Donor response error:", error);
    return res.status(500).json({ message: "Could not save your response." });
  }
}

async function getHospitalResponses(req, res) {
  const ownRequests = await Request.find({ hospital: req.user._id }).select("_id").lean();
  const ids = ownRequests.map(r => r._id);
  const responses = await Response.find({ request: { $in: ids } })
    .populate("request", "bloodGroup units city urgency status requiredBy")
    .populate("donor", "name phone email")
    .sort({ respondedAt: -1 }).lean();
  return res.json({
    count: responses.length,
    responses: responses.map(r => ({
      ...r,
      donor: r.status === "accepted" ? r.donor : (r.donor ? { name: r.donor.name } : null)
    }))
  });
}

module.exports = { respondToRequest, getHospitalResponses };