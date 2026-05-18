import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <section className="page-card">
        <p className="eyebrow">Loading</p>
        <h1>Checking your session</h1>
        <p className="page-copy">
          Please wait while BudgetBuddy restores your account.
        </p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
