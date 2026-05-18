import { useEffect, useMemo, useState } from "react";
import { authApi, profileApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    currency: "INR",
    monthlyIncome: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    profileApi
      .getProfile()
      .then((response) => {
        if (!active) return;
        setProfile(response.data);
        setForm({
          name: response.data?.name || "",
          email: response.data?.email || "",
          phone: response.data?.phone || "",
          dateOfBirth: response.data?.dateOfBirth
            ? new Date(response.data.dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: response.data?.gender || "",
          currency: response.data?.currency || "INR",
          monthlyIncome: String(response.data?.monthlyIncome || ""),
        });
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load profile");
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

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updatePasswordField(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return "Not available";
    return new Date(profile.createdAt).toLocaleDateString("en-IN");
  }, [profile]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await profileApi.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        currency: form.currency,
        monthlyIncome: form.monthlyIncome
          ? Number(form.monthlyIncome)
          : undefined,
      });

      setProfile(response.data);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setPasswordSaving(true);
    setError("");
    setSuccess("");

    try {
      await authApi.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );

      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSuccess("Password updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account permanently?")) return;

    try {
      await profileApi.deleteAccount();
      logout();
    } catch (err) {
      setError(err.message || "Failed to delete account");
    }
  }

  const { firstName, lastName } = splitName(profile?.name || "");

  return (
    <section className="page-stack">
      <div className="page-card dashboard-card profile-hero">
        <p className="eyebrow">Profile</p>
        <h1>{profile?.name || "User profile"}</h1>
        <p className="page-copy">
          Manage your personal details, password, and account settings.
        </p>
        <div className="profile-avatar">
          {(profile?.name || "U").charAt(0).toUpperCase()}
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <div className="dashboard-grid two-column-grid">
        <section className="page-card dashboard-card">
          <h2>Account overview</h2>
          {loading ? (
            <p className="page-copy">Loading profile...</p>
          ) : (
            <div className="dashboard-mini-grid">
              <div>
                <span className="status-label">First name</span>
                <strong>{firstName || "Not set"}</strong>
              </div>
              <div>
                <span className="status-label">Last name</span>
                <strong>{lastName || "Not set"}</strong>
              </div>
              <div>
                <span className="status-label">Email</span>
                <strong>{profile?.email || "Not set"}</strong>
              </div>
              <div>
                <span className="status-label">Member since</span>
                <strong>{memberSince}</strong>
              </div>
              <div>
                <span className="status-label">Income</span>
                <strong>{formatCurrency(profile?.monthlyIncome || 0)}</strong>
              </div>
              <div>
                <span className="status-label">Currency</span>
                <strong>{profile?.currency || "INR"}</strong>
              </div>
            </div>
          )}
        </section>

        <form
          className="page-card dashboard-card form-card"
          onSubmit={saveProfile}
        >
          <h2>Edit profile</h2>
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={updateField} />
          </label>
          <label>
            Date of birth
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={updateField}
            />
          </label>
          <label>
            Gender
            <input name="gender" value={form.gender} onChange={updateField} />
          </label>
          <label>
            Monthly income
            <input
              type="number"
              min="0"
              name="monthlyIncome"
              value={form.monthlyIncome}
              onChange={updateField}
            />
          </label>
          <label>
            Currency
            <input
              name="currency"
              value={form.currency}
              onChange={updateField}
            />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>

      <div className="dashboard-grid two-column-grid">
        <form
          className="page-card dashboard-card form-card"
          onSubmit={savePassword}
        >
          <h2>Update password</h2>
          <label>
            Current password
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={updatePasswordField}
              required
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={passwordSaving}
          >
            {passwordSaving ? "Updating..." : "Update password"}
          </button>
        </form>

        <section className="page-card dashboard-card danger-panel">
          <h2>Danger zone</h2>
          <p className="page-copy">
            Deleting your account removes your profile and data permanently.
          </p>
          <button
            className="secondary-button danger-button"
            type="button"
            onClick={deleteAccount}
          >
            Delete account
          </button>
        </section>
      </div>
    </section>
  );
}
