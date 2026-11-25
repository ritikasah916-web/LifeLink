const router = require("express").Router();
const { getAdminStats, getAdminUsers, updateUserStatus, getAdminRequests, updateRequestStatus } = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("admin"));
router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/requests", getAdminRequests);
router.patch("/requests/:id/status", updateRequestStatus);
module.exports = router;