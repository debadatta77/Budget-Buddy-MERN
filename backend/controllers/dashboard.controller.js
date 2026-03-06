const Expense = require("../models/Expense.model");
const Budget = require("../models/Budget.model");
const SavingsGoal = require("../models/SavingsGoal.model");
const {
  successResponse,
  getCurrentMonthRange,
  groupExpensesByCategory,
} = require("../utils/helpers");

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const dateRange = getCurrentMonthRange();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get current month expenses
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    }).sort({ date: -1 });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Get budget
    let budget = await Budget.findOne({
      user: req.user.id,
      month: currentMonth,
      year: currentYear,
    });

    if (!budget) {
      budget = await Budget.create({
        user: req.user.id,
        monthlyBudget: 0,
        spent: totalExpenses,
        month: currentMonth,
        year: currentYear,
      });
    }

    // Get savings goals
    const savingsGoals = await SavingsGoal.find({
      user: req.user.id,
      status: { $ne: "cancelled" },
    });

    const totalSavings = savingsGoals.reduce(
      (sum, goal) => sum + goal.savedAmount,
      0,
    );
    const activeSavingsGoals = savingsGoals.filter(
      (goal) => goal.status === "in-progress",
    ).length;

    // Get today's expenses
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: -1 });

    const todayTotal = todayExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Get category breakdown
    const categoryBreakdown = groupExpensesByCategory(expenses);

    // Calculate stats
    const remaining = budget.monthlyBudget - totalExpenses;
    const budgetPercentage =
      budget.monthlyBudget > 0
        ? Math.round((totalExpenses / budget.monthlyBudget) * 100)
        : 0;

    // Get last month data for comparison
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const lastMonthStart = new Date(lastYear, lastMonth - 1, 1);
    const lastMonthEnd = new Date(lastYear, lastMonth, 0, 23, 59, 59, 999);

    const lastMonthExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const lastMonthTotal = lastMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Calculate percentage change
    const expenseChange =
      lastMonthTotal > 0
        ? Math.round(((totalExpenses - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalExpenses,
          totalBudget: budget.monthlyBudget,
          remaining,
          budgetPercentage,
          totalSavings,
          activeSavingsGoals,
          expenseChange,
        },
        todayExpenses: {
          transactions: todayExpenses,
          total: todayTotal,
          count: todayExpenses.length,
        },
        categoryBreakdown,
        recentExpenses: expenses.slice(0, 10),
        period: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// @desc    Get statistics for charts
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStatistics = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const now = new Date();
    let startDate, endDate;

    if (period === "week") {
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      const dateRange = getCurrentMonthRange();
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Group by date for chart
    const dailyExpenses = {};
    expenses.forEach((expense) => {
      const date = expense.date.toISOString().split("T")[0];
      dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
    });

    // Group by category
    const categoryExpenses = groupExpensesByCategory(expenses);

    successResponse(res, 200, {
      dailyExpenses,
      categoryExpenses,
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      period: { startDate, endDate, type: period },
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
