import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/add-expense", icon: "➕", label: "Add Expense" },
  { to: "/view-expenses", icon: "📄", label: "View Expenses" },
  { to: "/budget-savings", icon: "💰", label: "Budget & Savings" },
  { to: "/profile", icon: "👤", label: "Profile Info" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-icon">💰</span>
          <span className="logo-text">BudgetBuddy</span>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>{user?.name || "User"}</h3>
            <p>{user?.email || "Not available"}</p>
          </div>
        </div>

        <nav className="nav-menu" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="logout-btn" onClick={logout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
