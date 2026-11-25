const Donor = require("../models/Donor");

async function getMyDonorProfile(req, res) {
  const donor = await Donor.findOne({ user: req.user._id }).populate("user", "name email phone");
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });
  return res.json({ donor });
}

async function updateMyDonorProfile(req, res) {
  const { city, bloodGroup, isAvailable, lastDonationDate } = req.body || {};
  const updates = {};
  if (city !== undefined) {
    if (typeof city !== "string" || !city.trim()) return res.status(400).json({ message: "City cannot be empty." });
    updates.city = city.trim();
  }
  if (bloodGroup !== undefined) {
    if (!["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group." });
    }
    updates.bloodGroup = bloodGroup;
  }
  if (isAvailable !== undefined) {
    if (typeof isAvailable !== "boolean") return res.status(400).json({ message: "Availability must be true or false." });
    updates.isAvailable = isAvailable;
  }
  if (lastDonationDate !== undefined) {
    if (lastDonationDate === null || lastDonationDate === "") updates.lastDonationDate = null;
    else {
      const date = new Date(lastDonationDate);
      if (Number.isNaN(date.getTime()) || date > new Date()) return res.status(400).json({ message: "Enter a valid past donation date." });
      updates.lastDonationDate = date;
    }
  }
  const donor = await Donor.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true })
    .populate("user", "name email phone");
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });
  return res.json({ message: "Donor profile updated.", donor });
}

module.exports = { getMyDonorProfile, updateMyDonorProfile };