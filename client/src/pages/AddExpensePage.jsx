import { useEffect, useState } from "react";
import { expenseApi } from "../services/api";

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Rent",
  "Other",
];

const categoryIcons = {
  "Food & Dining": "🍽️",
  Transportation: "🚗",
  Shopping: "🛍️",
  Utilities: "💡",
  Healthcare: "🩺",
  Entertainment: "🎬",
  Education: "📚",
  Rent: "🏠",
  Other: "✨",
};

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function AddExpensePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    amount: "",
    category: "Food & Dining",
    description: "",
    date: today,
  });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const now = new Date();

    expenseApi
      .getSummary(now.getMonth() + 1, now.getFullYear())
      .then((response) => {
        if (active) {
          setSummary(response.data);
        }
      })
      .catch(() => {
        if (active) {
          setSummary(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await expenseApi.addExpense({
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      });

      setSuccess("Expense added successfully.");
      setForm((current) => ({
        ...current,
        amount: "",
        description: "",
      }));

      const now = new Date();
      const response = await expenseApi.getSummary(
        now.getMonth() + 1,
        now.getFullYear(),
      );
      setSummary(response.data);
    } catch (err) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-card dashboard-card page-hero page-hero--expense">
        <div>
          <p className="eyebrow">Expense entry</p>
          <h1>Add expense</h1>
          <p className="page-copy">
            Record a new transaction and keep your budget updated automatically.
          </p>
        </div>
        <div className="hero-stats-grid hero-stats-grid--expense">
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">➕</span>
            <div>
              <strong>Add fast</strong>
              <p>Quick entry with guided fields</p>
            </div>
          </div>
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">📊</span>
            <div>
              <strong>Instant summary</strong>
              <p>See this month at a glance</p>
            </div>
          </div>
          <div className="hero-stat-chip">
            <span className="hero-stat-icon">🎨</span>
            <div>
              <strong>Icon categories</strong>
              <p>More visual and easier to scan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid two-column-grid">
        <form
          className="page-card dashboard-card form-card"
          onSubmit={handleSubmit}
        >
          <div className="section-title compact-title">
            <span className="section-icon">🧾</span>
            New expense
          </div>

          <div className="expense-form-grid">
            <label className="goal-field goal-field--wide">
              Amount
              <div className="input-icon-wrap">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={updateField}
                  required
                />
              </div>
            </label>

            <label className="goal-field goal-field--wide">
              Category
              <select
                name="category"
                value={form.category}
                onChange={updateField}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryIcons[category] || "•"} {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="goal-field goal-field--wide">
              Description
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="What did you spend on?"
              />
            </label>

            <label className="goal-field goal-field--wide">
              Date
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={updateField}
                required
              />
            </label>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}
          {success ? <div className="success-box">{success}</div> : null}

          <button
            className="primary-button wide-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add expense"}
          </button>
        </form>

        <section className="page-card dashboard-card">
          <div className="section-title compact-title">
            <span className="section-icon">📈</span>
            This month
          </div>
          {summary ? (
            <div className="summary-strip summary-strip--modern expense-summary-grid">
              <div className="expense-metric-card expense-metric-card--blue">
                <span className="status-label">Total spent</span>
                <strong>{formatCurrency(summary.total)}</strong>
                <p>All expense activity this month</p>
              </div>
              <div className="expense-metric-card expense-metric-card--violet">
                <span className="status-label">Transactions</span>
                <strong>{summary.count || 0}</strong>
                <p>Recorded transactions</p>
              </div>
              <div className="expense-metric-card expense-metric-card--emerald">
                <span className="status-label">From</span>
                <strong>
                  {new Date(summary.period?.startDate).toLocaleDateString(
                    "en-IN",
                  )}
                </strong>
                <p>Start date</p>
              </div>
              <div className="expense-metric-card expense-metric-card--amber">
                <span className="status-label">To</span>
                <strong>
                  {new Date(summary.period?.endDate).toLocaleDateString(
                    "en-IN",
                  )}
                </strong>
                <p>End date</p>
              </div>
            </div>
          ) : (
            <p className="page-copy">Month summary is unavailable right now.</p>
          )}
        </section>
      </div>
    </section>
  );
}
