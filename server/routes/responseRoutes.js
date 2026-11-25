const router = require("express").Router();
const { respondToRequest, getHospitalResponses } = require("../controllers/responseController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/:requestId/respond", protect, authorizeRoles("donor"), respondToRequest);
router.get("/hospital", protect, authorizeRoles("hospital"), getHospitalResponses);
module.exports = router;