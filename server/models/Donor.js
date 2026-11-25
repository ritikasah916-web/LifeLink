const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true },
  city: { type: String, required: true, trim: true },
  lastDonationDate: { type: Date, default: null },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Donor", donorSchema);