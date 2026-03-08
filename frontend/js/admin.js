// Admin analytics page script
const ADMIN_KEY_STORAGE = "budgetbuddy_admin_key";

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function showError(message) {
  const box = document.getElementById("errorBox");
  if (!box) return;

  box.style.display = "block";
  box.textContent = message;
}

function clearError() {
  const box = document.getElementById("errorBox");
  if (!box) return;

  box.style.display = "none";
  box.textContent = "";
}

function populateOverview(overview) {
  document.getElementById("totalUsers").textContent = overview.totalUsers || 0;
  document.getElementById("activeUsers").textContent =
    overview.activeUsers || 0;
  document.getElementById("avgSpending").textContent = formatCurrency(
    overview.averageSpendingPerUser,
  );
  document.getElementById("totalSpending").textContent = formatCurrency(
    overview.totalSpending,
  );
}

function populateCategories(categories) {
  const tbody = document.getElementById("categoryTableBody");
  if (!tbody) return;

  if (!categories || categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No category data found.</td></tr>';
    return;
  }

  tbody.innerHTML = categories
    .map(
      (item) => `
      <tr>
        <td>${item.category}</td>
        <td>${formatCurrency(item.totalAmount)}</td>
        <td>${item.transactions}</td>
      </tr>
    `,
    )
    .join("");
}

function populateTopSpenders(spenders) {
  const tbody = document.getElementById("spenderTableBody");
  if (!tbody) return;

  if (!spenders || spenders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No spender data found.</td></tr>';
    return;
  }

  tbody.innerHTML = spenders
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${formatCurrency(item.totalSpent)}</td>
        <td>${item.transactions}</td>
      </tr>
    `,
    )
    .join("");
}

async function loadAdminAnalytics() {
  const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE);
  if (!adminKey) {
    showError("Enter your Admin Access Key to view analytics.");
    return;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch admin analytics.");
    }
    if (!data.success) {
      showError(data.message || "Failed to fetch admin analytics.");
      return;
    }

    clearError();
    const { overview, topCategories, topSpenders } = data.data;
    populateOverview(overview || {});
    populateCategories(topCategories || []);
    populateTopSpenders(topSpenders || []);
  } catch (error) {
    console.error("Admin analytics error:", error);
    showError(error.message || "Could not load analytics.");
  }
}

function lockPage() {
  if (confirm("Lock admin page and clear saved key?")) {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    window.location.reload();
  }
}

function unlockAndLoad() {
  const input = document.getElementById("adminKeyInput");
  const key = input?.value?.trim();

  if (!key) {
    showError("Please enter Admin Access Key.");
    return;
  }

  localStorage.setItem(ADMIN_KEY_STORAGE, key);
  clearError();
  loadAdminAnalytics();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem(ADMIN_KEY_STORAGE) || "";
  const keyInput = document.getElementById("adminKeyInput");
  if (keyInput && savedKey) {
    keyInput.value = savedKey;
  }

  document.getElementById("adminName").textContent = "Admin";
  document.getElementById("adminEmail").textContent = "Key-based access";

  loadAdminAnalytics();
});
