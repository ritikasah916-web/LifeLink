require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const responseRoutes = require("./routes/responseRoutes");
const adminRoutes = require("./routes/adminRoutes");
const initializeNotifications = require("./socket/notificationHandler");

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, { cors: { origin: allowedOrigin, methods: ["GET", "POST", "PATCH"] } });

app.use(cors({ origin: allowedOrigin, methods: ["GET", "POST", "PATCH", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));
app.set("io", io);
initializeNotifications(io);

app.get("/", (req, res) => res.json({ name: "LifeLink API", status: "ok" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "LifeLink API" }));

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "API endpoint not found." }));
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ message: "Unexpected server error." });
});

const PORT = process.env.PORT || 5000;
async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`LifeLink API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not start LifeLink:", error.message);
    process.exit(1);
  }
}
if (require.main === module) start();
module.exports = { app, server, io, start };