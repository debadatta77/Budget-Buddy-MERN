const User = require("../models/User.model");
const Expense = require("../models/Expense.model");

// @desc    Get admin analytics overview
// @route   GET /api/admin/analytics
// @access  Private (x-admin-key)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const spendingSummary = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalSpending: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          activeUsers: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSpending: 1,
          totalTransactions: 1,
          activeUsersCount: { $size: "$activeUsers" },
        },
      },
    ]);

    const totals = spendingSummary[0] || {
      totalSpending: 0,
      totalTransactions: 0,
      activeUsersCount: 0,
    };

    const averageSpendingPerUser =
      totalUsers > 0 ? totals.totalSpending / totalUsers : 0;

    const topCategories = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
          transactions: 1,
        },
      },
    ]);

    const topSpenders = await Expense.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          transactions: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers: totals.activeUsersCount,
          totalSpending: totals.totalSpending,
          totalTransactions: totals.totalTransactions,
          averageSpendingPerUser,
        },
        topCategories,
        topSpenders,
      },
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching admin analytics",
      error: error.message,
    });
  }
};
