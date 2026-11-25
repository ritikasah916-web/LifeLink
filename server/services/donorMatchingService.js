const Donor = require("../models/Donor");

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// This is only a preliminary software filter, not a medical eligibility decision.
function isDonorPreliminarilyEligible(donor, minDays = Number(process.env.MIN_DAYS_BETWEEN_DONATIONS || 90)) {
  if (!donor || !donor.isAvailable) return false;
  if (!donor.lastDonationDate) return true;
  if (!Number.isFinite(minDays) || minDays < 0) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - minDays);
  return new Date(donor.lastDonationDate) <= cutoff;
}

async function findMatchingDonors(bloodRequest) {
  if (!bloodRequest?.bloodGroup || !bloodRequest?.city) return [];
  const city = `^${escapeRegex(String(bloodRequest.city).trim())}$`;
  const donors = await Donor.find({
    bloodGroup: bloodRequest.bloodGroup,
    city: { $regex: city, $options: "i" },
    isAvailable: true
  }).populate("user", "name email phone isActive");
  return donors.filter(d => d.user?.isActive && isDonorPreliminarilyEligible(d));
}

module.exports = { findMatchingDonors, isDonorPreliminarilyEligible, escapeRegex };