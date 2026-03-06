// View Expenses Integration Script
// This file will be included in view-expenses.html

// Check authentication
if (!Utils.requireAuth()) {
  // Will redirect to login
}

// Load user data early (will run again on DOMContentLoaded for safety)
const currentUser = AuthHelper.getUser();
function populateUserInfo() {
  const user = AuthHelper.getUser();
  if (user) {
    const name = user.name || "User";
    const email = user.email || "";
    const avatar = (user.name || "U").charAt(0).toUpperCase();
    const nameEl = document.querySelector(".user-info h3");
    const emailEl = document.querySelector(".user-info p");
    const avatarEl = document.querySelector(".user-avatar");
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = avatar;
  }
}
populateUserInfo();

let expenses = [];
let currentExpenseId = null;
let currentSort = "date-desc";

// Category data
const categoryData = {
  "Food & Dining": { icon: "🍔", color: "food" },
  Transportation: { icon: "🚗", color: "transport" },
  Shopping: { icon: "🛒", color: "shopping" },
  Utilities: { icon: "💡", color: "utilities" },
  Healthcare: { icon: "🏥", color: "healthcare" },
  Entertainment: { icon: "🎬", color: "entertainment" },
  Education: { icon: "📚", color: "education" },
  Rent: { icon: "🏠", color: "rent" },
  Other: { icon: "💳", color: "other" },
};

// Fetch and display expenses
async function fetchExpenses(filters = {}) {
  try {
    const response = await ExpenseAPI.getExpenses(filters);

    if (response && response.success) {
      expenses = response.data || [];
      displayExpenses(expenses);
      updateExpensesCount(response.count || 0);
    } else {
      console.error("Invalid response structure:", response);
      Utils.showError("Failed to load expenses");
      displayExpenses([]);
    }
  } catch (error) {
    console.error("Error fetching expenses:", error);
    Utils.showError("Failed to load expenses: " + error.message);
    displayExpenses([]);
  }
}

// Display expenses grouped by date
function displayExpenses(expensesList) {
  const container = document.querySelector(".expenses-list");

  if (!expensesList || expensesList.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No expenses found</h3>
                <p>Try adjusting your filters or add your first expense</p>
                <button class="add-expense-btn" onclick="goToAddExpense()">
                    <span>➕</span>
                    <span>Add Expense</span>
                </button>
            </div>
        `;
    return;
  }

  // Apply sorting
  let sortedExpenses = [...expensesList];

  if (currentSort === "date-desc") {
    sortedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === "date-asc") {
    sortedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === "amount-desc") {
    sortedExpenses.sort((a, b) => b.amount - a.amount);
  } else if (currentSort === "amount-asc") {
    sortedExpenses.sort((a, b) => a.amount - b.amount);
  }

  // Group by date
  const grouped = {};
  sortedExpenses.forEach((expense) => {
    const date = new Date(expense.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped[date]) {
      grouped[date] = {
        date: date,
        expenses: [],
        total: 0,
      };
    }
    grouped[date].expenses.push(expense);
    grouped[date].total += expense.amount;
  });

  // Build HTML
  let html = "";
  Object.values(grouped).forEach((group) => {
    html += `
            <div class="date-group">
                <div class="date-header">
                    <span>📅</span>
                    <h3>${group.date}</h3>
                    <span class="date-total">-₹${group.total.toFixed(2)}</span>
                </div>
                <div class="expense-list">
        `;

    group.expenses.forEach((expense) => {
      const catData = categoryData[expense.category] || categoryData["Other"];
      html += `
                <div class="expense-item ${catData.color}">
                    <div class="expense-left">
                        <div class="expense-icon">${catData.icon}</div>
                        <div class="expense-details">
                            <h4>${expense.category}</h4>
                            <p>${expense.description || "No description"}</p>
                        </div>
                    </div>
                    <div class="expense-right">
                        <div class="expense-amount">-₹${expense.amount.toFixed(2)}</div>
                        <div class="expense-actions">
                            <button class="action-btn edit-btn" onclick="editExpense('${expense._id}')">✏️</button>
                            <button class="action-btn delete-btn" onclick="confirmDeleteExpense('${expense._id}')">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
    });

    html += `
                </div>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Update expenses count
function updateExpensesCount(count) {
  const countEl = document.querySelector(".expenses-count strong");
  if (countEl) {
    countEl.textContent = count;
  }
}

// Apply filters
function applyFilters() {
  const filters = {
    startDate: document.getElementById("dateFrom").value,
    endDate: document.getElementById("dateTo").value,
    category: document.getElementById("categoryFilter").value,
    search: document.getElementById("searchInput").value,
  };

  // Remove empty filters
  Object.keys(filters).forEach((key) => {
    if (!filters[key]) delete filters[key];
  });

  fetchExpenses(filters);
}

// Clear filters
function clearFilters() {
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("searchInput").value = "";
  fetchExpenses();
}

// Sort functionality
function changeSorting(button) {
  // Remove active class from all sort buttons
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  button.classList.add("active");

  // Get sort value
  const sortValue = button.getAttribute("data-sort");
  currentSort = sortValue;

  // Re-fetch with current filters
  applyFilters();
}

// View toggle functionality
function changeView(button) {
  // Remove active class from all view buttons
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  button.classList.add("active");

  // Get view type
  const viewType = button.getAttribute("data-view");

  // Apply view changes (can be extended for category view)
  if (viewType === "date") {
    displayExpenses(expenses);
  } else if (viewType === "category") {
    // TODO: Implement category view grouping
    displayExpenses(expenses);
  }
}

// Edit expense
async function editExpense(id) {
  try {
    const response = await ExpenseAPI.getExpenseById(id);

    if (response.success) {
      const expense = response.data;
      currentExpenseId = id;

      // Fill form
      document.getElementById("editAmount").value = expense.amount;
      document.getElementById("editCategory").value = expense.category;
      document.getElementById("editDate").value = expense.date.split("T")[0];
      document.getElementById("editDescription").value =
        expense.description || "";

      // Show modal
      document.getElementById("editModal").classList.add("show");
    } else {
      console.error("Invalid response structure:", response);
      Utils.showError("Failed to load expense details: Invalid response");
    }
  } catch (error) {
    console.error("Error fetching expense:", error);
    Utils.showError("Failed to load expense details: " + error.message);
  }
}

// Update expense
async function handleEditSubmit(event) {
  event.preventDefault();

  const expenseData = {
    amount: parseFloat(document.getElementById("editAmount").value),
    category: document.getElementById("editCategory").value,
    date: document.getElementById("editDate").value,
    description: document.getElementById("editDescription").value,
  };

  try {
    const response = await ExpenseAPI.updateExpense(
      currentExpenseId,
      expenseData,
    );

    if (response && response.success) {
      closeEditModal();
      fetchExpenses();
      alert("Expense updated successfully!");
    } else {
      console.error("Invalid response structure:", response);
      Utils.showError("Failed to update expense: Invalid response");
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    Utils.showError("Failed to update expense: " + error.message);
  }
}

// Confirm delete
function confirmDeleteExpense(id) {
  currentExpenseId = id;
  document.getElementById("deleteModal").classList.add("show");
}

// Delete expense
async function deleteExpense() {
  try {
    const response = await ExpenseAPI.deleteExpense(currentExpenseId);

    if (response && response.success) {
      closeDeleteModal();
      fetchExpenses();
      alert("Expense deleted successfully!");
    } else {
      console.error("Invalid response structure:", response);
      Utils.showError("Failed to delete expense: Invalid response");
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    Utils.showError("Failed to delete expense: " + error.message);
  }
}

// Modal functions
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
}

// Navigation
function goToAddExpense() {
  window.location.href = "add-expense.html";
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("mobile-hidden");
  document.getElementById("overlay").classList.toggle("show");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    AuthHelper.removeToken();
    window.location.href = "index.html";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  populateUserInfo();
  // Clear old data immediately to prevent showing placeholder content
  const container = document.querySelector(".expenses-list");
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF;">
        <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
        <p>Loading expenses...</p>
      </div>
    `;
  }

  // Set max date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateFrom").max = today;
  document.getElementById("dateTo").max = today;

  // Fetch expenses
  fetchExpenses();

  // Attach event listeners
  document
    .getElementById("editForm")
    .addEventListener("submit", handleEditSubmit);
});
