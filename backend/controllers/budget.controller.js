const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");
const {
  errorResponse,
  successResponse,
  getCurrentMonthRange,
} = require("../utils/helpers");

// @desc    Create or update budget
// @route   POST /api/budget
// @access  Private
exports.setBudget = async (req, res) => {
  try {
    const { monthlyBudget, month, year, categoryBudgets } = req.body;

    if (!monthlyBudget || monthlyBudget < 0) {
      return errorResponse(res, 400, "Please provide a valid monthly budget");
    }

    const budgetMonth = month || new Date().getMonth() + 1;
    const budgetYear = year || new Date().getFullYear();

    // Check if budget exists for this month
    let budget = await Budget.findOne({
      user: req.user.id,
      month: budgetMonth,
      year: budgetYear,
    });

    // Calculate current spent amount from expenses
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: new Date(budgetYear, budgetMonth - 1, 1),
        $lte: new Date(budgetYear, budgetMonth, 0, 23, 59, 59, 999),
      },
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (budget) {
      // Update existing budget
      budget.monthlyBudget = monthlyBudget;
      budget.spent = spent;
      if (categoryBudgets) {
        budget.categoryBudgets = categoryBudgets;
      }
      await budget.save();
    } else {
      // Create new budget
      budget = await Budget.create({
        user: req.user.id,
        monthlyBudget,
        spent,
        month: budgetMonth,
        year: budgetYear,
        categoryBudgets: categoryBudgets || [],
      });
    }

    successResponse(res, 200, budget, "Budget set successfully");
  } catch (error) {
    console.error("Set budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error setting budget",
      error: error.message,
    });
  }
};

// @desc    Get current month budget
// @route   GET /api/budget
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    const budgetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const budgetYear = year ? parseInt(year) : new Date().getFullYear();

    let budget = await Budget.findOne({
      user: req.user.id,
      month: budgetMonth,
      year: budgetYear,
    });

    if (!budget) {
      // Create default budget if doesn't exist
      const expenses = await Expense.find({
        user: req.user.id,
        date: {
          $gte: new Date(budgetYear, budgetMonth - 1, 1),
          $lte: new Date(budgetYear, budgetMonth, 0, 23, 59, 59, 999),
        },
      });

      const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      budget = await Budget.create({
        user: req.user.id,
        monthlyBudget: 0,
        spent,
        month: budgetMonth,
        year: budgetYear,
      });
    }

    // Calculate budget status
    const percentage =
      budget.monthlyBudget > 0
        ? Math.round((budget.spent / budget.monthlyBudget) * 100)
        : 0;

    let status = "safe";
    if (percentage >= 90) status = "danger";
    else if (percentage >= 70) status = "warning";

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        percentage,
        status,
      },
    });
  } catch (error) {
    console.error("Get budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching budget",
      error: error.message,
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budget/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return errorResponse(res, 404, "Budget not found");
    }

    if (budget.user.toString() !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to delete this budget");
    }

    await budget.deleteOne();

    successResponse(res, 200, {}, "Budget deleted successfully");
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting budget",
      error: error.message,
    });
  }
};
