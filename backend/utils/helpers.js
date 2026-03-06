// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate password strength
exports.isStrongPassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

// Format date to YYYY-MM-DD
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get date range for current month
exports.getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { startDate: firstDay, endDate: lastDay };
};

// Get date range for a specific month and year
exports.getMonthRange = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate: firstDay, endDate: lastDay };
};

// Calculate percentage
exports.calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Format currency
exports.formatCurrency = (amount, currency = "INR") => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return `${symbols[currency] || "₹"}${amount.toFixed(2)}`;
};

// Group expenses by date
exports.groupExpensesByDate = (expenses) => {
  const grouped = {};

  expenses.forEach((expense) => {
    const date = exports.formatDate(expense.date);
    if (!grouped[date]) {
      grouped[date] = {
        date,
        expenses: [],
        total: 0,
      };
    }
    grouped[date].expenses.push(expense);
    grouped[date].total += expense.amount;
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
};

// Group expenses by category
exports.groupExpensesByCategory = (expenses) => {
  const grouped = {};
  let total = 0;

  expenses.forEach((expense) => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = {
        category: expense.category,
        amount: 0,
        count: 0,
      };
    }
    grouped[expense.category].amount += expense.amount;
    grouped[expense.category].count += 1;
    total += expense.amount;
  });

  // Add percentage
  Object.keys(grouped).forEach((category) => {
    grouped[category].percentage = exports.calculatePercentage(
      grouped[category].amount,
      total,
    );
  });

  return Object.values(grouped).sort((a, b) => b.amount - a.amount);
};

// Validate date is not in future
exports.isValidDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate <= today;
};

// Error response helper
exports.errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Success response helper
exports.successResponse = (res, statusCode, data, message = "Success") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
