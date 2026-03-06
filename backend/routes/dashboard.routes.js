const express = require("express");
const router = express.Router();
const {
  getDashboardData,
  getStatistics,
} = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.use(protect);

router.get("/", getDashboardData);
router.get("/stats", getStatistics);

module.exports = router;
