require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function main() {
  const [name, email, password, phone = "0000000000"] = process.argv.slice(2);
  if (!name || !email || !password || password.length < 8) {
    console.log('Usage: npm run create-admin -- "Admin Name" admin@example.com "StrongPassword123" 9999999999');
    process.exitCode = 1;
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new Error("An account with this email already exists.");
  const user = await User.create({
    name, email: normalizedEmail, password: await bcrypt.hash(password, 12),
    phone, role: "admin"
  });
  console.log(`Admin created: ${user.email}`);
  await mongoose.disconnect();
}
main().catch(async error => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});