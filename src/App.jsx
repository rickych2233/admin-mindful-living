import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginCard from "./components/LoginCard";
import DashboardPage from "./components/dashboard/DashboardPage";
import { login, logout, tryRestoreSession } from "./auth";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reload: silently restore the session from the httpOnly refresh cookie.
  useEffect(() => {
    tryRestoreSession().then(setIsAuthenticated);
  }, []);

  const handleLoginSubmit = async ({ email, password }) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMessage("");
    try {
      await login(email.trim(), password);
      setIsAuthenticated(true);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "Email atau password salah.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setErrorMessage("");
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginCard
              onSubmit={handleLoginSubmit}
              errorMessage={errorMessage}
              isSubmitting={isSigningIn}
            />
          )
        }
      />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <main className="dashboard-page">
              <DashboardPage onLogout={handleLogout} />
            </main>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
