import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AddExpensePage from "./pages/AddExpensePage";
import ExpensesPage from "./pages/ExpensesPage";
import BudgetSavingsPage from "./pages/BudgetSavingsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import PlaceholderPage from "./pages/PlaceholderPage";

const pages = [
  {
    path: "/",
    title: "Login / Register",
    description: "Authentication shell for BudgetBuddy.",
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "Summary cards, charts, and recent activity.",
  },
  {
    path: "/add-expense",
    title: "Add Expense",
    description: "Expense entry form.",
  },
  {
    path: "/view-expenses",
    title: "View Expenses",
    description: "Filterable expense list.",
  },
  {
    path: "/budget-savings",
    title: "Budget & Savings",
    description: "Budget setup and savings goal management.",
  },
  {
    path: "/profile",
    title: "Profile",
    description: "User profile and account settings.",
  },
  {
    path: "/admin",
    title: "Admin Analytics",
    description: "Admin-only analytics overview.",
  },
];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            {pages
              .filter((page) => page.path !== "/")
              .map((page) => (
                <Route
                  key={page.path}
                  path={page.path.slice(1)}
                  element={
                    page.path === "/dashboard" ? (
                      <DashboardPage />
                    ) : page.path === "/add-expense" ? (
                      <AddExpensePage />
                    ) : page.path === "/view-expenses" ? (
                      <ExpensesPage />
                    ) : page.path === "/budget-savings" ? (
                      <BudgetSavingsPage />
                    ) : page.path === "/profile" ? (
                      <ProfilePage />
                    ) : page.path === "/admin" ? (
                      <AdminPage />
                    ) : (
                      <PlaceholderPage
                        title={page.title}
                        description={page.description}
                      />
                    )
                  }
                />
              ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AuthProvider>
  );
}
