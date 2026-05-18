import { useEffect, useMemo, useState } from "react";
import { expenseApi } from "../services/api";

const categories = [
  "",
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

export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    search: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "Food & Dining",
    description: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);

  async function loadExpenses(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const normalizedFilters = Object.fromEntries(
        Object.entries(nextFilters).filter(([, value]) => value),
      );

      const [expensesResponse, summaryResponse] = await Promise.all([
        expenseApi.getExpenses(normalizedFilters),
        expenseApi.getSummary(
          new Date().getMonth() + 1,
          new Date().getFullYear(),
        ),
      ]);

      setExpenses(expensesResponse.data || []);
      setSummary(summaryResponse.data || null);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function updateEditField(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  async function applyFilters(event) {
    event.preventDefault();
    await loadExpenses(filters);
  }

  function resetFilters() {
    const cleared = { startDate: "", endDate: "", category: "", search: "" };
    setFilters(cleared);
    loadExpenses(cleared);
  }

  function beginEdit(expense) {
    setEditingId(expense._id);
    setEditForm({
      amount: String(expense.amount || ""),
      category: expense.category || "Food & Dining",
      description: expense.description || "",
      date: expense.date
        ? new Date(expense.date).toISOString().slice(0, 10)
        : "",
    });
  }

  async function saveExpense(event) {
    event.preventDefault();
    if (!editingId) return;

    setSaving(true);
    setError("");

    try {
      await expenseApi.updateExpense(editingId, {
        amount: Number(editForm.amount),
        category: editForm.category,
        description: editForm.description,
        date: editForm.date,
      });

      setEditingId(null);
      await loadExpenses(filters);
    } catch (err) {
      setError(err.message || "Failed to update expense");
    } finally {
      setSaving(false);
    }
  }

  async function removeExpense(id) {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    try {
      await expenseApi.deleteExpense(id);
      await loadExpenses(filters);
    } catch (err) {
      setError(err.message || "Failed to delete expense");
    }
  }

  const grouped = useMemo(() => {
    return expenses.reduce((accumulator, expense) => {
      const key = formatDate(expense.date);
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(expense);
      return accumulator;
    }, {});
  }, [expenses]);

  return (
    <section className="page-stack">
      <div className="page-card dashboard-card">
        <p className="eyebrow">Expense tracker</p>
        <h1>View expenses</h1>
        <p className="page-copy">
          Filter, edit, and manage your transaction history.
        </p>
      </div>

      <div className="dashboard-grid two-column-grid">
        <form
          className="page-card dashboard-card form-card"
          onSubmit={applyFilters}
        >
          <h2>Filters</h2>

          <label>
            Search
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Search notes"
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={filters.category}
              onChange={updateFilter}
            >
              {categories.map((category) => (
                <option key={category || "all"} value={category}>
                  {category || "All categories"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start date
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={updateFilter}
            />
          </label>

          <label>
            End date
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={updateFilter}
            />
          </label>

          <div className="inline-actions">
            <button className="primary-button" type="submit">
              Apply filters
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          {summary ? (
            <div className="summary-strip">
              <strong>{formatCurrency(summary.total)}</strong>
              <span>{summary.count || 0} transactions this month</span>
            </div>
          ) : null}
        </form>

        <section className="page-card dashboard-card">
          <h2>Entries</h2>

          {loading ? (
            <p className="page-copy">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="page-copy">
              No expenses matched the current filters.
            </p>
          ) : (
            <div className="list-stack">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date} className="date-group">
                  <div className="category-topline">
                    <strong>{date}</strong>
                    <span>{items.length} items</span>
                  </div>

                  <div className="list-stack">
                    {items.map((expense) => (
                      <article
                        key={expense._id}
                        className="list-row expense-row"
                      >
                        <div>
                          <strong>{expense.category}</strong>
                          <p>{expense.description || "No description"}</p>
                        </div>
                        <div className="row-actions">
                          <strong>-{formatCurrency(expense.amount)}</strong>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => beginEdit(expense)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-button danger"
                            onClick={() => removeExpense(expense._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {editingId ? (
        <form
          className="page-card dashboard-card form-card"
          onSubmit={saveExpense}
        >
          <h2>Edit expense</h2>

          <label>
            Amount
            <input
              type="number"
              name="amount"
              min="1"
              value={editForm.amount}
              onChange={updateEditField}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={editForm.category}
              onChange={updateEditField}
            >
              {categories.filter(Boolean).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description
            <input
              type="text"
              name="description"
              value={editForm.description}
              onChange={updateEditField}
            />
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={editForm.date}
              onChange={updateEditField}
              required
            />
          </label>

          <div className="inline-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
