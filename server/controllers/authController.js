const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Donor = require("../models/Donor");

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function registerUser(req, res) {
  let createdUser;
  try {
    const { name, email, password, phone, role, bloodGroup, city, lastDonationDate } = req.body || {};
    if (![name, email, password, phone].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Name, email, password and phone are required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be between 8 and 72 characters." });
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Enter a valid phone number." });
    }
    if (!["donor", "hospital"].includes(role)) {
      return res.status(400).json({ message: "Choose donor or hospital registration." });
    }
    if (role === "donor" && (!BLOOD_GROUPS.includes(bloodGroup) || typeof city !== "string" || !city.trim())) {
      return res.status(400).json({ message: "Donor registration requires a valid blood group and city." });
    }
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ message: "This email is already registered." });

    createdUser = await User.create({
      name: name.trim(), email: cleanEmail, password: await bcrypt.hash(password, 12),
      phone: phone.trim(), role
    });
    if (role === "donor") {
      const donationDate = lastDonationDate ? new Date(lastDonationDate) : null;
      if (donationDate && (Number.isNaN(donationDate.getTime()) || donationDate > new Date())) {
        await User.findByIdAndDelete(createdUser._id);
        return res.status(400).json({ message: "Last donation date must be a valid date in the past." });
      }
      await Donor.create({
        user: createdUser._id, bloodGroup, city: city.trim(),
        lastDonationDate: donationDate
      });
    }
    return res.status(201).json({
      message: "Account created. You can now log in.",
      user: { id: createdUser._id, name: createdUser.name, email: createdUser.email, role: createdUser.role }
    });
  } catch (error) {
    if (createdUser?._id) await User.findByIdAndDelete(createdUser._id).catch(() => {});
    if (error.code === 11000) return res.status(409).json({ message: "This email is already registered." });
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = createToken(user);
    return res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
}

module.exports = { registerUser, loginUser };