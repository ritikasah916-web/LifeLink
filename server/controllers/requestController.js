const mongoose = require("mongoose");
const Request = require("../models/Request");
const Donor = require("../models/Donor");
const Response = require("../models/Response");
const { findMatchingDonors, isDonorPreliminarilyEligible, escapeRegex } = require("../services/donorMatchingService");

async function createRequest(req, res) {
  try {
    const { bloodGroup, units, city, urgency = "normal", requiredBy, hospitalNotes = "" } = req.body || {};
    if (!["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(bloodGroup)) {
      return res.status(400).json({ message: "Select a valid blood group." });
    }
    if (!Number.isInteger(Number(units)) || Number(units) < 1 || Number(units) > 100) {
      return res.status(400).json({ message: "Units must be a whole number between 1 and 100." });
    }
    if (typeof city !== "string" || !city.trim()) return res.status(400).json({ message: "City is required." });
    if (!["normal", "urgent", "critical"].includes(urgency)) return res.status(400).json({ message: "Invalid urgency." });
    const deadline = new Date(requiredBy);
    if (!requiredBy || Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      return res.status(400).json({ message: "Choose a future required-by date and time." });
    }
    const request = await Request.create({
      hospital: req.user._id, bloodGroup, units: Number(units), city: city.trim(),
      urgency, requiredBy: deadline, hospitalNotes: String(hospitalNotes).trim()
    });
    const matchingDonors = await findMatchingDonors(request);
    const io = req.app.get("io");
    matchingDonors.forEach(donor => {
      if (donor.user?._id && io) io.to(`donor-${donor.user._id}`).emit("new-blood-request", {
        requestId: request._id, bloodGroup, units: request.units, city: request.city,
        urgency, requiredBy: request.requiredBy
      });
    });
    return res.status(201).json({
      message: "Blood request published successfully.",
      request,
      matchingDonorsCount: matchingDonors.length
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Could not create the blood request." });
  }
}

async function getHospitalRequests(req, res) {
  const requests = await Request.find({ hospital: req.user._id }).sort({ createdAt: -1 }).lean();
  return res.json({ count: requests.length, requests });
}

async function getMatchingRequests(req, res) {
  const donor = await Donor.findOne({ user: req.user._id });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });
  if (!donor.isAvailable || !isDonorPreliminarilyEligible(donor)) {
    return res.json({ count: 0, requests: [], reason: "availability" });
  }
  const responded = await Response.find({ donor: req.user._id }).distinct("request");
  const cityPattern = `^${escapeRegex(donor.city.trim())}$`;
  const requests = await Request.find({
    bloodGroup: donor.bloodGroup,
    city: { $regex: cityPattern, $options: "i" },
    status: "pending",
    requiredBy: { $gt: new Date() },
    _id: { $nin: responded }
  }).populate("hospital", "name").sort({ urgency: -1, createdAt: -1 }).lean();
  return res.json({ count: requests.length, requests });
}

async function cancelRequest(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid request ID." });
  const request = await Request.findOne({ _id: req.params.id, hospital: req.user._id });
  if (!request) return res.status(404).json({ message: "Request not found." });
  if (request.status !== "pending") return res.status(400).json({ message: "Only pending requests can be cancelled." });
  request.status = "cancelled";
  await request.save();
  return res.json({ message: "Request cancelled.", request });
}

module.exports = { createRequest, getHospitalRequests, getMatchingRequests, cancelRequest };