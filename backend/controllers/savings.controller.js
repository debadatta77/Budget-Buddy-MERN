const SavingsGoal = require("../models/SavingsGoal.model");
const { errorResponse, successResponse } = require("../utils/helpers");

// @desc    Create new savings goal
// @route   POST /api/savings
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, category, icon, description } =
      req.body;

    if (!name || !targetAmount || !deadline) {
      return errorResponse(
        res,
        400,
        "Please provide name, target amount, and deadline",
      );
    }

    if (targetAmount <= 0) {
      return errorResponse(res, 400, "Target amount must be greater than 0");
    }

    const goal = await SavingsGoal.create({
      user: req.user.id,
      name,
      targetAmount,
      deadline,
      category,
      icon,
      description,
    });

    successResponse(res, 201, goal, "Savings goal created successfully");
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating savings goal",
      error: error.message,
    });
  }
};

// @desc    Get all savings goals
// @route   GET /api/savings
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching savings goals",
      error: error.message,
    });
  }
};

// @desc    Get single savings goal
// @route   GET /api/savings/:id
// @access  Private
exports.getGoalById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return errorResponse(res, 404, "Savings goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to access this goal");
    }

    successResponse(res, 200, goal);
  } catch (error) {
    console.error("Get goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching savings goal",
      error: error.message,
    });
  }
};

// @desc    Update savings goal
// @route   PUT /api/savings/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    let goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return errorResponse(res, 404, "Savings goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this goal");
    }

    goal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    successResponse(res, 200, goal, "Savings goal updated successfully");
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating savings goal",
      error: error.message,
    });
  }
};

// @desc    Add savings to goal
// @route   POST /api/savings/:id/add
// @access  Private
exports.addSavings = async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 400, "Please provide a valid amount");
    }

    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return errorResponse(res, 404, "Savings goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this goal");
    }

    // Add transaction
    goal.transactions.push({
      amount,
      note,
      date: new Date(),
    });

    // Update saved amount
    goal.savedAmount += amount;

    await goal.save();

    successResponse(res, 200, goal, "Savings added successfully");
  } catch (error) {
    console.error("Add savings error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding savings",
      error: error.message,
    });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return errorResponse(res, 404, "Savings goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to delete this goal");
    }

    await goal.deleteOne();

    successResponse(res, 200, {}, "Savings goal deleted successfully");
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting savings goal",
      error: error.message,
    });
  }
};
