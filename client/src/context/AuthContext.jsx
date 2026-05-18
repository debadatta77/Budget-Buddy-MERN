import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authApi,
  clearAuthSession,
  getStoredUser,
  setAuthSession,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() =>
    localStorage.getItem("budgetbuddy_token"),
  );
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();

        if (!isMounted) {
          return;
        }

        if (response?.success && response.data) {
          setUser(response.data);
          setAuthSession({ token, user: response.data });
        }
      } catch {
        clearAuthSession();
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await authApi.login(email, password);
    setAuthSession({ token: response.token, user: response.user });
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function register(name, email, password) {
    const response = await authApi.register(name, email, password);
    setAuthSession({ token: response.token, user: response.user });
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
