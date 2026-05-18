import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../services/api";

const periodLabels = {
  week: "Last 7 days",
  month: "This month",
  year: "This year",
};

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [dashboardResponse, statsResponse] = await Promise.all([
          dashboardApi.getDashboardData(),
          dashboardApi.getStatistics(period),
        ]);

        if (!isMounted) return;

        setDashboard(dashboardResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const summaryCards = useMemo(() => {
    if (!dashboard?.summary) return [];

    const summary = dashboard.summary;

    return [
      {
        label: "Total expenses",
        value: formatCurrency(summary.totalExpenses),
        icon: "💸",
        tone: "rose",
      },
      {
        label: "Monthly budget",
        value: formatCurrency(summary.totalBudget),
        icon: "🎯",
        tone: "blue",
      },
      {
        label: "Remaining",
        value: formatCurrency(summary.remaining),
        icon: "🧩",
        tone: "emerald",
      },
      {
        label: "Budget used",
        value: `${summary.budgetPercentage || 0}%`,
        icon: "📊",
        tone: "violet",
      },
      {
        label: "Savings",
        value: formatCurrency(summary.totalSavings),
        icon: "🏦",
        tone: "teal",
      },
      {
        label: "Active goals",
        value: String(summary.activeSavingsGoals || 0),
        icon: "⭐",
        tone: "amber",
      },
    ];
  }, [dashboard]);

  const recentExpenses = dashboard?.recentExpenses || [];
  const categories = stats?.categoryExpenses || [];
  const dailyEntries = Object.entries(stats?.dailyExpenses || {})
    .sort(([leftDate], [rightDate]) => new Date(leftDate) - new Date(rightDate))
    .slice(-7);

  const categoryChart = useMemo(() => {
    const palette = [
      "#2563eb",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
    ];
    const getCategoryAmount = (entry) =>
      Number(entry.amount ?? entry.totalAmount ?? entry.value ?? 0);

    const topAmount = Math.max(...categories.map(getCategoryAmount), 1);

    return categories.map((entry, index) => ({
      ...entry,
      value: getCategoryAmount(entry),
      percent: Math.max((getCategoryAmount(entry) / topAmount) * 100, 8),
      color: palette[index % palette.length],
      icon: ["🍽️", "🎬", "🛒", "🚗", "📚", "🏠"][index % 6],
      count: Number(entry.count || 0),
    }));
  }, [categories]);

  const trendChart = useMemo(() => {
    const palette = [
      "#3b82f6",
      "#0ea5e9",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#14b8a6",
    ];
    const topAmount = Math.max(
      ...dailyEntries.map(([, value]) => Number(value || 0)),
      1,
    );

    return dailyEntries.map(([date, value], index) => ({
      date,
      value: Number(value || 0),
      percent: Math.max((Number(value || 0) / topAmount) * 100, 8),
      color: palette[index % palette.length],
    }));
  }, [dailyEntries]);

  return (
    <div>
      <header className="page-header">
        <h1>Welcome Back! 👋</h1>
        <p>Here's your financial overview for today</p>
      </header>

      {loading ? (
        <section className="section">Loading dashboard data...</section>
      ) : error ? (
        <section className="section auth-error">{error}</section>
      ) : (
        <>
          <div className="stats-grid">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className={`summary-card summary-card--${card.tone}`}
              >
                <div className="summary-card-header">
                  <span className="summary-label">{card.label}</span>
                  <span className="summary-icon-badge" aria-hidden="true">
                    {card.icon}
                  </span>
                </div>
                <strong className="summary-value">{card.value}</strong>
                <p className="summary-note">Live backend data</p>
              </article>
            ))}
          </div>

          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">📅</span>
                Today's Transactions
              </div>
              <button
                className="add-new-btn"
                type="button"
                onClick={() => navigate("/add-expense")}
              >
                <span>➕</span>
                <span>Add New</span>
              </button>
            </div>

            <div className="section-toolbar">
              <span className="section-subtitle">
                Report window: {periodLabels[period]}
              </span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="period-select"
              >
                <option value="week">Last 7 days</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="no-transactions">
                <div className="no-transactions-icon">📭</div>
                <h3>No transactions today</h3>
                <p>Start tracking your expenses to see them here</p>
              </div>
            ) : (
              <div className="list-stack">
                {recentExpenses.map((expense) => (
                  <article key={expense._id} className="list-row">
                    <div>
                      <strong>{expense.category}</strong>
                      <p>{expense.description || "No description"}</p>
                    </div>
                    <div className="row-meta">
                      <strong>-{formatCurrency(expense.amount)}</strong>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="two-panel-grid">
            <section className="section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-icon">📊</span>
                  Category Distribution
                </div>
              </div>
              {categories.length === 0 ? (
                <p className="page-copy">No category data available yet.</p>
              ) : (
                <div className="chart-card">
                  {categoryChart.map((entry) => (
                    <article
                      key={entry.category}
                      className="chart-row chart-row--bar"
                    >
                      <div className="chart-label-block">
                        <span className="chart-label-icon">{entry.icon}</span>
                        <div>
                          <strong>{entry.category}</strong>
                          <p>
                            {Math.round(entry.percent)}% of top category
                            {entry.count ? ` · ${entry.count} items` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="chart-bar-track" aria-hidden="true">
                        <div
                          className="chart-bar-fill"
                          style={{
                            width: `${entry.percent}%`,
                            background: entry.color,
                          }}
                        />
                      </div>
                      <strong className="chart-value">
                        {formatCurrency(entry.value)}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-icon">📈</span>
                  Monthly Trend
                </div>
              </div>
              {dailyEntries.length === 0 ? (
                <p className="page-copy">
                  No chart data available for this range.
                </p>
              ) : (
                <div className="chart-card">
                  {trendChart.map((entry) => (
                    <article
                      key={entry.date}
                      className="chart-row chart-row--bar"
                    >
                      <div className="chart-label-block">
                        <span className="chart-label-icon chart-label-icon--trend">
                          📆
                        </span>
                        <div>
                          <strong>{formatDate(entry.date)}</strong>
                          <p>Daily spend</p>
                        </div>
                      </div>
                      <div className="chart-bar-track" aria-hidden="true">
                        <div
                          className="chart-bar-fill"
                          style={{
                            width: `${entry.percent}%`,
                            background: entry.color,
                          }}
                        />
                      </div>
                      <strong className="chart-value">
                        {formatCurrency(entry.value)}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
