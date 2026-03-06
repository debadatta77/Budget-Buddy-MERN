const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteAccount,
} = require("../controllers/profile.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.use(protect);

router.route("/").get(getProfile).put(updateProfile).delete(deleteAccount);

module.exports = router;
