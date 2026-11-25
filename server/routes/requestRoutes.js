const router = require("express").Router();
const { createRequest, getHospitalRequests, getMatchingRequests, cancelRequest } = require("../controllers/requestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/matching", protect, authorizeRoles("donor"), getMatchingRequests);
router.post("/", protect, authorizeRoles("hospital"), createRequest);
router.get("/", protect, authorizeRoles("hospital"), getHospitalRequests);
router.patch("/:id/cancel", protect, authorizeRoles("hospital"), cancelRequest);
module.exports = router;