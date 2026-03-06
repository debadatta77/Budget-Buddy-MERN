const express = require("express");
const router = express.Router();
const {
  setBudget,
  getBudget,
  deleteBudget,
} = require("../controllers/budget.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.use(protect);

router.route("/").get(getBudget).post(setBudget);

router.delete("/:id", deleteBudget);

module.exports = router;
