const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  addSavings,
  deleteGoal,
} = require("../controllers/savings.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.use(protect);

router.route("/").get(getGoals).post(createGoal);

router.post("/:id/add", addSavings);

router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);

module.exports = router;
