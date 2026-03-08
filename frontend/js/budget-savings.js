// Budget & Savings Integration Script

// Check authentication
if (!Utils.requireAuth()) {
  // Will redirect to login
}

// Load user data
const currentUser = AuthHelper.getUser();
if (currentUser) {
  document.querySelector(".user-info h3").textContent =
    currentUser.name || "User";
  document.querySelector(".user-info p").textContent = currentUser.email || "";
  document.querySelector(".user-avatar").textContent = (currentUser.name || "U")
    .charAt(0)
    .toUpperCase();
}

let budgetData = null;
let savingsGoals = [];
let currentGoalId = null;
let currentEditMode = "add";
let budgetChart = null;

function handleAuthOrApiError(error, fallbackMessage) {
  const message = String(error?.message || fallbackMessage || "Request failed");
  const isAuthError =
    message.toLowerCase().includes("not authorized") ||
    message.toLowerCase().includes("token is invalid") ||
    message.toLowerCase().includes("token is invalid or expired") ||
    message.toLowerCase().includes("please login") ||
    message.includes("401");

  if (isAuthError) {
    AuthHelper.removeToken();
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
    return;
  }

  Utils.showError(message || fallbackMessage || "Something went wrong");
}

// Fetch budget data
async function fetchBudgetData() {
  try {
    const now = new Date();
    const response = await BudgetAPI.getBudget(
      now.getMonth() + 1,
      now.getFullYear(),
    );

    if (response.success) {
      budgetData = response.data;
      displayBudgetData(budgetData);
    }
  } catch (error) {
    console.error("Error fetching budget:", error);
    handleAuthOrApiError(error, "Failed to load budget data");
  }
}

// Display budget data
function displayBudgetData(data) {
  // Update budget alert
  const alertEl = document.querySelector(".budget-alert");
  alertEl.className = `budget-alert ${data.status || "safe"}`;

  const alertTitle = alertEl.querySelector("h3");
  const alertText = alertEl.querySelector("p");

  if (data.status === "danger") {
    alertTitle.textContent = "⚠️ Budget Alert!";
    alertText.textContent = `You've spent ${data.percentage}% of your monthly budget. Consider reducing expenses.`;
  } else if (data.status === "warning") {
    alertTitle.textContent = "⚠️ Budget Warning";
    alertText.textContent = `You've spent ${data.percentage}% of your monthly budget. Watch your spending.`;
  } else {
    alertTitle.textContent = "✅ You're On Track!";
    alertText.textContent = `You're doing great! ${data.percentage}% of budget used.`;
  }

  // Update stats
  const budgetTotal = document.getElementById("budgetTotal");
  const budgetSpent = document.getElementById("budgetSpent");
  const budgetRemaining = document.getElementById("budgetRemaining");

  if (budgetTotal)
    budgetTotal.textContent = `₹${data.monthlyBudget.toLocaleString()}`;
  if (budgetSpent) budgetSpent.textContent = `₹${data.spent.toFixed(0)}`;
  if (budgetRemaining)
    budgetRemaining.textContent = `₹${data.remaining.toFixed(0)}`;

  // Update progress bar using ID
  const progressBar = document.getElementById("budgetProgressBar");
  const progressPercentage = document.getElementById("budgetPercentage");

  if (progressBar) {
    progressBar.style.width = `${Math.min(data.percentage, 100)}%`;
    progressBar.textContent = `${data.percentage}%`;
    progressBar.className = `progress-bar ${data.status || "safe"}`;
  }

  if (progressPercentage) {
    progressPercentage.textContent = `${data.percentage}%`;
    progressPercentage.className = `progress-percentage ${data.status || "safe"}`;
  }

  renderBudgetChart(data);
}

// Render budget vs actual chart
function renderBudgetChart(data) {
  const ctx = document.getElementById("budgetChart");
  if (!ctx) return;

  if (budgetChart) {
    budgetChart.destroy();
  }

  budgetChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["This Month"],
      datasets: [
        {
          label: "Budget",
          data: [data.monthlyBudget || 0],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "#3B82F6",
          borderWidth: 2,
        },
        {
          label: "Spent",
          data: [data.spent || 0],
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderColor: "#EF4444",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `₹${value.toLocaleString()}`,
          },
        },
      },
    },
  });
}

// Open budget modal
function openBudgetModal() {
  if (budgetData) {
    document.getElementById("monthlyBudget").value = budgetData.monthlyBudget;
  }
  document.getElementById("budgetModal").classList.add("show");
}

// Close budget modal
function closeBudgetModal() {
  document.getElementById("budgetModal").classList.remove("show");
}

// Update budget
async function handleBudgetUpdate(event) {
  event.preventDefault();

  const budgetAmount = parseFloat(
    document.getElementById("monthlyBudget").value,
  );
  const now = new Date();

  try {
    const response = await BudgetAPI.setBudget({
      monthlyBudget: budgetAmount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (response.success) {
      closeBudgetModal();
      fetchBudgetData();
      alert("Budget updated successfully!");
    }
  } catch (error) {
    console.error("Error updating budget:", error);
    Utils.showError("Failed to update budget");
  }
}

// Fetch savings goals
async function fetchSavingsGoals() {
  try {
    const response = await SavingsAPI.getGoals();

    if (response.success) {
      savingsGoals = response.data;
      displaySavingsGoals(savingsGoals);
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
    handleAuthOrApiError(error, "Failed to load savings goals");
  }
}

// Display savings goals
function displaySavingsGoals(goals) {
  const container = document.querySelector(".goals-grid");

  if (!goals || goals.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <h3>No savings goals yet</h3>
                <p>Create your first savings goal to start tracking</p>
            </div>
        `;
    return;
  }

  container.innerHTML = goals
    .map((goal) => {
      const progress = goal.progress || 0;
      const remaining = goal.targetAmount - goal.savedAmount;
      const isCompleted = goal.status === "completed";

      return `
            <div class="goal-card ${isCompleted ? "completed" : ""}">
                <div class="goal-header">
                    <div class="goal-info">
                        <span style="font-size: 24px;">${goal.icon || "🎯"}</span>
                        <h3>${goal.name}</h3>
                        <p>Target: ₹${goal.targetAmount.toLocaleString()} by ${new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                    <div class="goal-actions">
                        ${!isCompleted ? `<button class="goal-action-btn add-savings-btn" onclick="openAddSavingsModal('${goal._id}')">💰 Add</button>` : ""}
                        <button class="goal-action-btn edit-goal-btn" onclick="openEditGoalModal('${goal._id}')">✏️</button>
                        <button class="goal-action-btn delete-goal-btn" onclick="confirmDeleteGoal('${goal._id}')">🗑️</button>
                    </div>
                </div>
                <div class="goal-amounts">
                    <div class="goal-amount">
                        <span class="goal-amount-label">Saved</span>
                        <span class="goal-amount-value">₹${goal.savedAmount.toLocaleString()}</span>
                    </div>
                    <div class="goal-amount">
                        <span class="goal-amount-label">Remaining</span>
                        <span class="goal-amount-value">₹${remaining.toLocaleString()}</span>
                    </div>
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar-container">
                        <div class="goal-progress-bar ${isCompleted ? "completed" : ""}" style="width: ${progress}%;"></div>
                    </div>
                    <div class="goal-progress-info">
                        <span class="goal-progress-percentage ${isCompleted ? "completed" : ""}">${progress}%</span>
                        ${!isCompleted ? `<span class="goal-remaining">₹${remaining.toLocaleString()} to go</span>` : ""}
                    </div>
                </div>
                ${isCompleted ? '<div class="goal-status completed">✅ Goal Completed!</div>' : '<div class="goal-status in-progress">🎯 In Progress</div>'}
            </div>
        `;
    })
    .join("");
}

// Open add goal modal
function openAddGoalModal() {
  currentEditMode = "add";
  document.getElementById("goalForm").reset();
  document.querySelector("#goalModal h2").textContent = "Create Savings Goal";
  document.getElementById("goalModal").classList.add("show");
}

// Open edit goal modal
async function openEditGoalModal(id) {
  try {
    const response = await SavingsAPI.getGoalById(id);

    if (response.success) {
      const goal = response.data;
      currentGoalId = id;
      currentEditMode = "edit";

      document.getElementById("goalName").value = goal.name;
      document.getElementById("targetAmount").value = goal.targetAmount;
      document.getElementById("goalDeadline").value =
        goal.deadline.split("T")[0];

      document.querySelector("#goalModal h2").textContent = "Edit Savings Goal";
      document.getElementById("goalModal").classList.add("show");
    }
  } catch (error) {
    console.error("Error fetching goal:", error);
    Utils.showError("Failed to load goal details");
  }
}

// Close goal modal
function closeGoalModal() {
  document.getElementById("goalModal").classList.remove("show");
}

// Handle goal submit
async function handleGoalSubmit(event) {
  event.preventDefault();

  const goalData = {
    name: document.getElementById("goalName").value,
    targetAmount: parseFloat(document.getElementById("targetAmount").value),
    deadline: document.getElementById("goalDeadline").value,
    icon: "🎯",
  };

  try {
    let response;
    if (currentEditMode === "add") {
      response = await SavingsAPI.createGoal(goalData);
    } else {
      response = await SavingsAPI.updateGoal(currentGoalId, goalData);
    }

    if (response.success) {
      closeGoalModal();
      fetchSavingsGoals();
      alert(
        `Goal ${currentEditMode === "add" ? "created" : "updated"} successfully!`,
      );
    }
  } catch (error) {
    console.error("Error saving goal:", error);
    Utils.showError("Failed to save goal");
  }
}

// Open add savings modal
function openAddSavingsModal(goalId) {
  currentGoalId = goalId;
  document.getElementById("addSavingsModal").classList.add("show");
}

// Close add savings modal
function closeAddSavingsModal() {
  document.getElementById("addSavingsModal").classList.remove("show");
  document.getElementById("addSavingsForm").reset();
}

// Handle add savings
async function handleAddSavings(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById("savingsAmount").value);
  const noteInput = document.getElementById("savingsNote");
  const note = noteInput ? noteInput.value : "";

  try {
    const response = await SavingsAPI.addSavings(currentGoalId, amount, note);

    if (response.success) {
      closeAddSavingsModal();
      fetchSavingsGoals();
      alert("Savings added successfully!");
    }
  } catch (error) {
    console.error("Error adding savings:", error);
    Utils.showError("Failed to add savings");
  }
}

// Confirm delete goal
function confirmDeleteGoal(goalId) {
  currentGoalId = goalId;
  document.getElementById("deleteModal").classList.add("show");
}

// Delete goal
async function deleteGoal() {
  try {
    const response = await SavingsAPI.deleteGoal(currentGoalId);

    if (response.success) {
      closeDeleteModal();
      fetchSavingsGoals();
      alert("Goal deleted successfully!");
    }
  } catch (error) {
    console.error("Error deleting goal:", error);
    Utils.showError("Failed to delete goal");
  }
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
}

// Navigation
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
  // Clear old data immediately to prevent showing placeholder content
  const budgetAlert = document.querySelector(".budget-alert");
  if (budgetAlert) {
    budgetAlert.innerHTML = `
      <div class="alert-icon">⏳</div>
      <div class="alert-content">
        <h3>Loading budget...</h3>
        <p>Fetching your budget information...</p>
      </div>
    `;
  }

  const goalsGrid = document.querySelector(".goals-grid");
  if (goalsGrid) {
    goalsGrid.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF; grid-column: 1/-1;">
        <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
        <p>Loading savings goals...</p>
      </div>
    `;
  }

  fetchBudgetData();
  fetchSavingsGoals();

  // Attach event listeners
  document
    .getElementById("budgetForm")
    .addEventListener("submit", handleBudgetUpdate);
  document
    .getElementById("goalForm")
    .addEventListener("submit", handleGoalSubmit);
  document
    .getElementById("addSavingsForm")
    .addEventListener("submit", handleAddSavings);
});
