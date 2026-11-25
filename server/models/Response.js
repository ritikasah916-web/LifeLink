const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["accepted", "declined"], required: true },
  respondedAt: { type: Date, default: Date.now }
}, { timestamps: true });

responseSchema.index({ request: 1, donor: 1 }, { unique: true });
module.exports = mongoose.model("Response", responseSchema);