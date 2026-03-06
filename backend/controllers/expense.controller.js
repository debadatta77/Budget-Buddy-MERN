const Expense = require('../models/Expense.model');
const Budget = require('../models/Budget.model');
const { 
  errorResponse, 
  successResponse, 
  isValidDate,
  groupExpensesByDate,
  groupExpensesByCategory,
  getCurrentMonthRange,
  getMonthRange
} = require('../utils/helpers');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validation
    if (!amount || !category || !date) {
      return errorResponse(res, 400, 'Please provide amount, category, and date');
    }

    if (amount <= 0) {
      return errorResponse(res, 400, 'Amount must be greater than 0');
    }

    if (!isValidDate(date)) {
      return errorResponse(res, 400, 'Date cannot be in the future');
    }

    // Create expense
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date
    });

    // Update budget spent amount
    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const budget = await Budget.findOne({ 
      user: req.user.id, 
      month, 
      year 
    });

    if (budget) {
      budget.spent += amount;
      
      // Update category budget if exists
      const categoryBudget = budget.categoryBudgets.find(cb => cb.category === category);
      if (categoryBudget) {
        categoryBudget.spent += amount;
      }
      
      await budget.save();
    }

    successResponse(res, 201, expense, 'Expense added successfully');
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense',
      error: error.message
    });
  }
};

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, search } = req.query;

    // Build query
    let query = { user: req.user.id };

    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to access this expense');
    }

    successResponse(res, 200, expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this expense');
    }

    const oldAmount = expense.amount;
    const oldDate = expense.date;
    const oldCategory = expense.category;

    // Update expense
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update budget if amount or date changed
    if (oldAmount !== expense.amount || oldDate.getTime() !== expense.date.getTime() || oldCategory !== expense.category) {
      // Remove old amount from old month budget
      const oldMonth = oldDate.getMonth() + 1;
      const oldYear = oldDate.getFullYear();
      const oldBudget = await Budget.findOne({ user: req.user.id, month: oldMonth, year: oldYear });
      if (oldBudget) {
        oldBudget.spent -= oldAmount;
        const oldCategoryBudget = oldBudget.categoryBudgets.find(cb => cb.category === oldCategory);
        if (oldCategoryBudget) {
          oldCategoryBudget.spent -= oldAmount;
        }
        await oldBudget.save();
      }

      // Add new amount to new month budget
      const newMonth = expense.date.getMonth() + 1;
      const newYear = expense.date.getFullYear();
      const newBudget = await Budget.findOne({ user: req.user.id, month: newMonth, year: newYear });
      if (newBudget) {
        newBudget.spent += expense.amount;
        const newCategoryBudget = newBudget.categoryBudgets.find(cb => cb.category === expense.category);
        if (newCategoryBudget) {
          newCategoryBudget.spent += expense.amount;
        }
        await newBudget.save();
      }
    }

    successResponse(res, 200, expense, 'Expense updated successfully');
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to delete this expense');
    }

    // Update budget
    const month = expense.date.getMonth() + 1;
    const year = expense.date.getFullYear();
    const budget = await Budget.findOne({ user: req.user.id, month, year });
    if (budget) {
      budget.spent -= expense.amount;
      const categoryBudget = budget.categoryBudgets.find(cb => cb.category === expense.category);
      if (categoryBudget) {
        categoryBudget.spent -= expense.amount;
      }
      await budget.save();
    }

    await expense.deleteOne();

    successResponse(res, 200, {}, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// @desc    Get expenses summary
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpensesSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateRange;

    if (month && year) {
      dateRange = getMonthRange(parseInt(year), parseInt(month));
    } else {
      dateRange = getCurrentMonthRange();
    }

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    }).sort({ date: -1 });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const byCategory = groupExpensesByCategory(expenses);
    const byDate = groupExpensesByDate(expenses);

    res.status(200).json({
      success: true,
      data: {
        total,
        count: expenses.length,
        byCategory,
        byDate,
        period: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses summary',
      error: error.message
    });
  }
};
