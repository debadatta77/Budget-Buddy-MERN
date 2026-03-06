// API Configuration
// Dynamically match frontend host (127.0.0.1 vs localhost)
const API_HOST =
  window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
const API_CONFIG = {
  BASE_URL: `http://${API_HOST}:8000/api`,
  ENDPOINTS: {
    // Auth
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_ME: "/auth/me",
    UPDATE_PASSWORD: "/auth/updatepassword",

    // Expenses
    EXPENSES: "/expenses",
    EXPENSE_BY_ID: (id) => `/expenses/${id}`,
    EXPENSES_SUMMARY: "/expenses/summary",

    // Budget
    BUDGET: "/budget",
    BUDGET_BY_ID: (id) => `/budget/${id}`,

    // Savings
    SAVINGS: "/savings",
    SAVINGS_BY_ID: (id) => `/savings/${id}`,
    ADD_SAVINGS: (id) => `/savings/${id}/add`,

    // Profile
    PROFILE: "/profile",

    // Dashboard
    DASHBOARD: "/dashboard",
    DASHBOARD_STATS: "/dashboard/stats",
  },
};

// Auth Helper Functions
const AuthHelper = {
  // Save token to localStorage
  saveToken(token) {
    localStorage.setItem("budgetbuddy_token", token);
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem("budgetbuddy_token");
  },

  // Remove token (logout)
  removeToken() {
    localStorage.removeItem("budgetbuddy_token");
    localStorage.removeItem("budgetbuddy_user");
  },

  // Save user data
  saveUser(user) {
    localStorage.setItem("budgetbuddy_user", JSON.stringify(user));
  },

  // Get user data
  getUser() {
    const user = localStorage.getItem("budgetbuddy_user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};

// API Helper Functions
const API = {
  // Generic GET request
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: AuthHelper.getAuthHeaders(),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: parseError.message,
        });
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("GET Error:", {
        url,
        errorName: error.name,
        message: error.message,
      });
      throw error;
    }
  },

  // Generic POST request
  async post(endpoint, body = {}) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        headers: AuthHelper.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: parseError.message,
        });
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("POST Error:", {
        endpoint: `${API_CONFIG.BASE_URL}${endpoint}`,
        errorName: error.name,
        message: error.message,
      });
      throw error;
    }
  },

  // Generic PUT request
  async put(endpoint, body = {}) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: AuthHelper.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: parseError.message,
        });
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("PUT Error:", {
        endpoint: `${API_CONFIG.BASE_URL}${endpoint}`,
        errorName: error.name,
        message: error.message,
      });
      throw error;
    }
  },

  // Generic DELETE request
  async delete(endpoint) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: AuthHelper.getAuthHeaders(),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: parseError.message,
        });
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("DELETE Error:", {
        endpoint: `${API_CONFIG.BASE_URL}${endpoint}`,
        errorName: error.name,
        message: error.message,
      });
      throw error;
    }
  },
};

// Auth API Functions
const AuthAPI = {
  async register(name, email, password) {
    return await API.post(API_CONFIG.ENDPOINTS.REGISTER, {
      name,
      email,
      password,
    });
  },

  async login(email, password) {
    return await API.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
  },

  async getMe() {
    return await API.get(API_CONFIG.ENDPOINTS.GET_ME);
  },

  async updatePassword(currentPassword, newPassword) {
    return await API.put(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },
};

// Expense API Functions
const ExpenseAPI = {
  async addExpense(expenseData) {
    return await API.post(API_CONFIG.ENDPOINTS.EXPENSES, expenseData);
  },

  async getExpenses(filters = {}) {
    return await API.get(API_CONFIG.ENDPOINTS.EXPENSES, filters);
  },

  async getExpenseById(id) {
    return await API.get(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id));
  },

  async updateExpense(id, expenseData) {
    return await API.put(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id), expenseData);
  },

  async deleteExpense(id) {
    return await API.delete(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id));
  },

  async getExpensesSummary(month, year) {
    return await API.get(API_CONFIG.ENDPOINTS.EXPENSES_SUMMARY, {
      month,
      year,
    });
  },
};

// Budget API Functions
const BudgetAPI = {
  async setBudget(budgetData) {
    return await API.post(API_CONFIG.ENDPOINTS.BUDGET, budgetData);
  },

  async getBudget(month, year) {
    return await API.get(API_CONFIG.ENDPOINTS.BUDGET, { month, year });
  },

  async deleteBudget(id) {
    return await API.delete(API_CONFIG.ENDPOINTS.BUDGET_BY_ID(id));
  },
};

// Savings API Functions
const SavingsAPI = {
  async createGoal(goalData) {
    return await API.post(API_CONFIG.ENDPOINTS.SAVINGS, goalData);
  },

  async getGoals(status) {
    return await API.get(
      API_CONFIG.ENDPOINTS.SAVINGS,
      status ? { status } : {},
    );
  },

  async getGoalById(id) {
    return await API.get(API_CONFIG.ENDPOINTS.SAVINGS_BY_ID(id));
  },

  async updateGoal(id, goalData) {
    return await API.put(API_CONFIG.ENDPOINTS.SAVINGS_BY_ID(id), goalData);
  },

  async addSavings(id, amount, note) {
    return await API.post(API_CONFIG.ENDPOINTS.ADD_SAVINGS(id), {
      amount,
      note,
    });
  },

  async deleteGoal(id) {
    return await API.delete(API_CONFIG.ENDPOINTS.SAVINGS_BY_ID(id));
  },
};

// Profile API Functions
const ProfileAPI = {
  async getProfile() {
    return await API.get(API_CONFIG.ENDPOINTS.PROFILE);
  },

  async updateProfile(profileData) {
    return await API.put(API_CONFIG.ENDPOINTS.PROFILE, profileData);
  },

  async deleteAccount() {
    return await API.delete(API_CONFIG.ENDPOINTS.PROFILE);
  },
};

// Dashboard API Functions
const DashboardAPI = {
  async getDashboardData() {
    return await API.get(API_CONFIG.ENDPOINTS.DASHBOARD);
  },

  async getStatistics(period = "month") {
    return await API.get(API_CONFIG.ENDPOINTS.DASHBOARD_STATS, { period });
  },
};

// Utility Functions
const Utils = {
  // Show loading spinner
  showLoading(element) {
    if (element) {
      element.style.opacity = "0.5";
      element.style.pointerEvents = "none";
    }
  },

  // Hide loading spinner
  hideLoading(element) {
    if (element) {
      element.style.opacity = "1";
      element.style.pointerEvents = "auto";
    }
  },

  // Show error message
  showError(message, duration = 3000) {
    alert(message); // Simple alert for now, can be enhanced with custom modal
  },

  // Show success message
  showSuccess(message, duration = 3000) {
    console.log("Success:", message);
    // Can be enhanced with custom toast notification
  },

  // Redirect to page
  redirect(page) {
    window.location.href = page;
  },

  // Check authentication and redirect if not logged in
  requireAuth() {
    if (!AuthHelper.isLoggedIn()) {
      Utils.redirect("index.html");
      return false;
    }
    return true;
  },
};
