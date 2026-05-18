import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <section className="branding-section">
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon">💰</div>
            <div className="logo-text">BudgetBuddy</div>
          </div>

          <p className="tagline">
            Track spending, build savings habits, and keep your finances under
            control.
          </p>

          <div className="illustration">
            <div className="illustration-content">📊</div>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="check-icon" />
              Real-time expense tracking
            </div>
            <div className="feature-item">
              <span className="check-icon" />
              Budget and savings goals
            </div>
            <div className="feature-item">
              <span className="check-icon" />
              Profile and admin analytics
            </div>
            <div className="feature-item">
              <span className="check-icon" />
              Built for resume deployment
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="form-container auth-panel">
          <div className="form-header">
            <h1 className="form-title">
              {mode === "login" ? "Welcome Back!" : "Create Account"}
            </h1>
            <p className="form-subtitle">
              {mode === "login"
                ? "Login to continue managing your budget"
                : "Register to start tracking your finances"}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Enter password"
                required
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Register"}
            </button>
          </form>

          <button
            type="button"
            className="text-button auth-toggle"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login"
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </section>
    </div>
  );
}
