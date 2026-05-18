import { useEffect, useState } from "react";
import { budgetApi, savingsApi } from "../services/api";

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BudgetSavingsPage() {
  const [budget, setBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ monthlyBudget: "" });
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "",
    icon: "🎯",
    description: "",
  });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [savingsForm, setSavingsForm] = useState({ amount: "", note: "" });
  const [editingGoal, setEditingGoal] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "",
    icon: "🎯",
    description: "",
    status: "in-progress",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const now = new Date();
    const [budgetResponse, goalsResponse] = await Promise.all([
      budgetApi.getBudget(now.getMonth() + 1, now.getFullYear()),
      savingsApi.getGoals(),
    ]);

    setBudget(budgetResponse.data);
    setBudgetForm({
      monthlyBudget: String(budgetResponse.data?.monthlyBudget || ""),
    });
    setGoals(goalsResponse.data || []);
  }

  useEffect(() => {
    let active = true;

    refresh()
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load budget and savings");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateBudgetField(event) {
    const { value } = event.target;
    setBudgetForm({ monthlyBudget: value });
  }

  function updateGoalField(event) {
    const { name, value } = event.target;
    setGoalForm((current) => ({ ...current, [name]: value }));
  }

  function updateEditGoalField(event) {
    const { name, value } = event.target;
    setEditGoalForm((current) => ({ ...current, [name]: value }));
  }

  function updateSavingsField(event) {
    const { name, value } = event.target;
    setSavingsForm((current) => ({ ...current, [name]: value }));
  }

  async function saveBudget(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const now = new Date();
      await budgetApi.setBudget({
        monthlyBudget: Number(budgetForm.monthlyBudget),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });

      await refresh();
      setSuccess("Budget updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update budget");
    }
  }

  async function createGoal(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await savingsApi.createGoal({
        ...goalForm,
        targetAmount: Number(goalForm.targetAmount),
      });
      setGoalForm({
        name: "",
        targetAmount: "",
        deadline: "",
        category: "",
        icon: "🎯",
        description: "",
      });
      await refresh();
      setSuccess("Savings goal created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create savings goal");
    }
  }

  function beginGoalEdit(goal) {
    setEditingGoal(goal._id);
    setEditGoalForm({
      name: goal.name || "",
      targetAmount: String(goal.targetAmount || ""),
      deadline: goal.deadline
        ? new Date(goal.deadline).toISOString().slice(0, 10)
        : "",
      category: goal.category || "",
      icon: goal.icon || "🎯",
      description: goal.description || "",
      status: goal.status || "in-progress",
    });
  }

  async function saveGoal(event) {
    event.preventDefault();
    if (!editingGoal) return;

    setError("");
    try {
      await savingsApi.updateGoal(editingGoal, {
        ...editGoalForm,
        targetAmount: Number(editGoalForm.targetAmount),
      });
      setEditingGoal(null);
      await refresh();
      setSuccess("Savings goal updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update savings goal");
    }
  }

  async function deleteGoal(id) {
    if (!window.confirm("Delete this savings goal?")) return;

    try {
      await savingsApi.deleteGoal(id);
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to delete savings goal");
    }
  }

  async function addSavings(event) {
    event.preventDefault();
    if (!selectedGoal) return;

    setError("");
    try {
      await savingsApi.addSavings(
        selectedGoal,
        Number(savingsForm.amount),
        savingsForm.note,
      );
      setSavingsForm({ amount: "", note: "" });
      setSelectedGoal(null);
      await refresh();
      setSuccess("Savings added successfully.");
    } catch (err) {
      setError(err.message || "Failed to add savings");
    }
  }

  return (
    <section className="page-stack">
      <div className="page-card dashboard-card page-hero page-hero--savings">
        <div>
          <p className="eyebrow">Budget and savings</p>
          <h1>Budget & savings</h1>
          <p className="page-copy">
            Set your monthly budget and manage long-term savings goals.
          </p>
        </div>
        <div className="hero-stats-grid">
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">💰</span>
            <div>
              <strong>{formatCurrency(budget?.monthlyBudget || 0)}</strong>
              <p>Monthly budget</p>
            </div>
          </div>
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">🏁</span>
            <div>
              <strong>{formatCurrency(budget?.remaining || 0)}</strong>
              <p>Remaining this month</p>
            </div>
          </div>
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">🎯</span>
            <div>
              <strong>{goals.length}</strong>
              <p>Active goals</p>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <div className="dashboard-grid two-column-grid">
        <form
          className="page-card dashboard-card form-card"
          onSubmit={saveBudget}
        >
          <div className="section-title compact-title">
            <span className="section-icon">📅</span>
            Monthly budget
          </div>

          <label>
            Budget amount
            <input
              type="number"
              min="0"
              value={budgetForm.monthlyBudget}
              onChange={updateBudgetField}
              required
            />
          </label>

          <button className="primary-button wide-button" type="submit">
            Save budget
          </button>

          <div className="summary-strip summary-strip--modern">
            <div>
              <span className="status-label">Budget</span>
              <strong>{formatCurrency(budget?.monthlyBudget || 0)}</strong>
            </div>
            <div>
              <span className="status-label">Spent</span>
              <strong>{formatCurrency(budget?.spent || 0)}</strong>
            </div>
            <div>
              <span className="status-label">Remaining</span>
              <strong>{formatCurrency(budget?.remaining || 0)}</strong>
            </div>
          </div>
        </form>

        <section className="page-card dashboard-card savings-create-panel">
          <div className="section-title compact-title">
            <span className="section-icon">✨</span>
            Create savings goal
          </div>
          <p className="page-copy">
            Give each goal an icon, category, and target so it feels like a real
            project.
          </p>

          <form className="goal-form-grid" onSubmit={createGoal}>
            <label className="goal-field goal-field--wide">
              Goal name
              <input
                name="name"
                value={goalForm.name}
                onChange={updateGoalField}
                required
              />
            </label>
            <label className="goal-field">
              Target amount
              <input
                type="number"
                min="1"
                name="targetAmount"
                value={goalForm.targetAmount}
                onChange={updateGoalField}
                required
              />
            </label>
            <label className="goal-field">
              Deadline
              <input
                type="date"
                name="deadline"
                value={goalForm.deadline}
                onChange={updateGoalField}
                required
              />
            </label>
            <label className="goal-field">
              Category
              <input
                name="category"
                value={goalForm.category}
                onChange={updateGoalField}
                placeholder="Travel, Emergency, etc."
              />
            </label>
            <label className="goal-field">
              Icon
              <input
                name="icon"
                value={goalForm.icon}
                onChange={updateGoalField}
                placeholder="🎯"
              />
            </label>
            <label className="goal-field goal-field--wide">
              Description
              <input
                name="description"
                value={goalForm.description}
                onChange={updateGoalField}
              />
            </label>

            <button className="primary-button wide-button" type="submit">
              Create goal
            </button>
          </form>
        </section>
      </div>

      <section className="page-card dashboard-card">
        <h2>Savings goals</h2>

        {loading ? (
          <p className="page-copy">Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="page-copy">No savings goals yet.</p>
        ) : (
          <div className="list-stack">
            {goals.map((goal) => {
              const progress = goal.progress || 0;
              const remaining =
                Number(goal.targetAmount || 0) - Number(goal.savedAmount || 0);

              return (
                <article key={goal._id} className="goal-card">
                  <div className="goal-card-header">
                    <div className="goal-card-icon">{goal.icon || "🎯"}</div>
                    <div>
                      <strong>{goal.name}</strong>
                      <p className="page-copy">
                        {goal.category || "Personal goal"}
                      </p>
                    </div>
                    <span className="goal-progress-badge">{progress}%</span>
                  </div>
                  <div className="category-topline">
                    <span>
                      Target {formatCurrency(goal.targetAmount)} by{" "}
                      {formatDate(goal.deadline)}
                    </span>
                  </div>
                  <div className="meter-track">
                    <div
                      className="meter-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="summary-strip compact summary-strip--modern">
                    <div>
                      <span className="status-label">Saved</span>
                      <strong>{formatCurrency(goal.savedAmount)}</strong>
                    </div>
                    <div>
                      <span className="status-label">Remaining</span>
                      <strong>{formatCurrency(remaining)}</strong>
                    </div>
                    <div>
                      <span className="status-label">Status</span>
                      <strong>{goal.status}</strong>
                    </div>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedGoal(goal._id)}
                    >
                      Add savings
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => beginGoalEdit(goal)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button danger-button"
                      onClick={() => deleteGoal(goal._id)}
                    >
                      Delete
                    </button>
                  </div>

                  {selectedGoal === goal._id ? (
                    <form
                      className="mini-form mini-form--accent"
                      onSubmit={addSavings}
                    >
                      <div className="section-title compact-title">
                        <span className="section-icon">💳</span>
                        Add savings
                      </div>
                      <label className="goal-field">
                        Amount
                        <input
                          type="number"
                          min="1"
                          name="amount"
                          value={savingsForm.amount}
                          onChange={updateSavingsField}
                          required
                        />
                      </label>
                      <label className="goal-field">
                        Note
                        <input
                          name="note"
                          value={savingsForm.note}
                          onChange={updateSavingsField}
                        />
                      </label>
                      <button
                        className="primary-button wide-button"
                        type="submit"
                      >
                        Save money
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {editingGoal ? (
        <form
          className="page-card dashboard-card form-card"
          onSubmit={saveGoal}
        >
          <div className="section-title compact-title">
            <span className="section-icon">🛠️</span>
            Edit savings goal
          </div>
          <label className="goal-field">
            Goal name
            <input
              name="name"
              value={editGoalForm.name}
              onChange={updateEditGoalField}
              required
            />
          </label>
          <label className="goal-field">
            Target amount
            <input
              type="number"
              min="1"
              name="targetAmount"
              value={editGoalForm.targetAmount}
              onChange={updateEditGoalField}
              required
            />
          </label>
          <label className="goal-field">
            Deadline
            <input
              type="date"
              name="deadline"
              value={editGoalForm.deadline}
              onChange={updateEditGoalField}
              required
            />
          </label>
          <label className="goal-field">
            Category
            <input
              name="category"
              value={editGoalForm.category}
              onChange={updateEditGoalField}
            />
          </label>
          <label className="goal-field">
            Icon
            <input
              name="icon"
              value={editGoalForm.icon}
              onChange={updateEditGoalField}
            />
          </label>
          <label className="goal-field">
            Description
            <input
              name="description"
              value={editGoalForm.description}
              onChange={updateEditGoalField}
            />
          </label>
          <label className="goal-field">
            Status
            <input
              name="status"
              value={editGoalForm.status}
              onChange={updateEditGoalField}
            />
          </label>

          <div className="inline-actions">
            <button className="primary-button" type="submit">
              Save goal
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setEditingGoal(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
