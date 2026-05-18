const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export function getAuthToken() {
  return localStorage.getItem("budgetbuddy_token");
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("budgetbuddy_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function setAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem("budgetbuddy_token", token);
  }

  if (user) {
    localStorage.setItem("budgetbuddy_user", JSON.stringify(user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("budgetbuddy_token");
  localStorage.removeItem("budgetbuddy_user");
}

export function getAuthHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const authApi = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(name, email, password) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  getMe() {
    return request("/auth/me");
  },

  updatePassword(currentPassword, newPassword) {
    return request("/auth/updatepassword", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

export const dashboardApi = {
  getDashboardData() {
    return request("/dashboard");
  },

  getStatistics(period = "month") {
    return request(`/dashboard/stats?period=${encodeURIComponent(period)}`);
  },
};

export const expenseApi = {
  addExpense(payload) {
    return request("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getExpenses(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return request(`/expenses${query ? `?${query}` : ""}`);
  },

  getExpenseById(id) {
    return request(`/expenses/${id}`);
  },

  updateExpense(id, payload) {
    return request(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteExpense(id) {
    return request(`/expenses/${id}`, {
      method: "DELETE",
    });
  },

  getSummary(month, year) {
    const query = new URLSearchParams({
      month: String(month),
      year: String(year),
    }).toString();
    return request(`/expenses/summary?${query}`);
  },
};

export const budgetApi = {
  getBudget(month, year) {
    const query = new URLSearchParams({
      month: String(month),
      year: String(year),
    }).toString();
    return request(`/budget?${query}`);
  },

  setBudget(payload) {
    return request("/budget", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteBudget(id) {
    return request(`/budget/${id}`, {
      method: "DELETE",
    });
  },
};

export const savingsApi = {
  getGoals(status) {
    const query = status
      ? `?${new URLSearchParams({ status }).toString()}`
      : "";
    return request(`/savings${query}`);
  },

  createGoal(payload) {
    return request("/savings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getGoalById(id) {
    return request(`/savings/${id}`);
  },

  updateGoal(id, payload) {
    return request(`/savings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  addSavings(id, amount, note) {
    return request(`/savings/${id}/add`, {
      method: "POST",
      body: JSON.stringify({ amount, note }),
    });
  },

  deleteGoal(id) {
    return request(`/savings/${id}`, {
      method: "DELETE",
    });
  },
};

export const profileApi = {
  getProfile() {
    return request("/profile");
  },

  updateProfile(payload) {
    return request("/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteAccount() {
    return request("/profile", {
      method: "DELETE",
    });
  },
};

export const adminApi = {
  getAnalytics(adminKey) {
    return request("/admin/analytics", {
      headers: {
        "x-admin-key": adminKey,
      },
    });
  },
};
