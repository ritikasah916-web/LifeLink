const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true },
  units: { type: Number, required: true, min: 1, max: 100 },
  city: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ["normal", "urgent", "critical"], default: "normal" },
  status: { type: String, enum: ["pending", "fulfilled", "cancelled"], default: "pending" },
  requiredBy: { type: Date, required: true },
  hospitalNotes: { type: String, default: "", maxlength: 1000 }
}, { timestamps: true });

requestSchema.index({ bloodGroup: 1, city: 1, status: 1, requiredBy: 1 });
module.exports = mongoose.model("Request", requestSchema);