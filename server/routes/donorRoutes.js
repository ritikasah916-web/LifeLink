const router = require("express").Router();
const { getMyDonorProfile, updateMyDonorProfile } = require("../controllers/donorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/me", protect, authorizeRoles("donor"), getMyDonorProfile);
router.patch("/me", protect, authorizeRoles("donor"), updateMyDonorProfile);
module.exports = router;