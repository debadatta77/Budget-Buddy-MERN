import { useEffect, useState } from "react";
import { adminApi } from "../services/api";

const ADMIN_KEY_STORAGE = "budgetbuddy_admin_key";

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) || "",
  );
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAnalytics(nextKey = adminKey) {
    if (!nextKey) {
      setError("Admin key is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminApi.getAnalytics(nextKey);
      setAnalytics(response.data);
      localStorage.setItem(ADMIN_KEY_STORAGE, nextKey);
    } catch (err) {
      setAnalytics(null);
      setError(err.message || "Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adminKey) {
      loadAnalytics(adminKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="page-stack">
      <div className="page-card dashboard-card">
        <p className="eyebrow">Admin</p>
        <h1>Analytics</h1>
        <p className="page-copy">
          Enter the admin access key to view platform analytics.
        </p>
      </div>

      <div className="page-card dashboard-card form-card">
        <label>
          Admin access key
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Paste admin key"
          />
        </label>
        <button
          className="primary-button"
          type="button"
          onClick={() => loadAnalytics(adminKey)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load analytics"}
        </button>
        <p className="page-copy">
          The key is stored locally in this browser after a successful load.
        </p>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}

      {analytics ? (
        <>
          <div className="stats-grid dashboard-grid">
            <article className="stat-card">
              <span className="status-label">Total users</span>
              <strong>{analytics.overview.totalUsers}</strong>
            </article>
            <article className="stat-card">
              <span className="status-label">Active users</span>
              <strong>{analytics.overview.activeUsers}</strong>
            </article>
            <article className="stat-card">
              <span className="status-label">Total spending</span>
              <strong>
                {formatCurrency(analytics.overview.totalSpending)}
              </strong>
            </article>
            <article className="stat-card">
              <span className="status-label">Transactions</span>
              <strong>{analytics.overview.totalTransactions}</strong>
            </article>
            <article className="stat-card">
              <span className="status-label">Avg per user</span>
              <strong>
                {formatCurrency(analytics.overview.averageSpendingPerUser)}
              </strong>
            </article>
          </div>

          <div className="dashboard-grid two-column-grid">
            <section className="page-card dashboard-card">
              <h2>Top categories</h2>
              <div className="list-stack">
                {analytics.topCategories.map((entry) => (
                  <article key={entry.category} className="list-row">
                    <strong>{entry.category}</strong>
                    <span>
                      {formatCurrency(entry.totalAmount)} · {entry.transactions}{" "}
                      tx
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="page-card dashboard-card">
              <h2>Top spenders</h2>
              <div className="list-stack">
                {analytics.topSpenders.map((entry) => (
                  <article key={entry.userId} className="list-row">
                    <div>
                      <strong>{entry.name}</strong>
                      <p>{entry.email}</p>
                    </div>
                    <span>{formatCurrency(entry.totalSpent)}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
