import React, { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginCard from "./components/LoginCard";
import DashboardPage from "./components/dashboard/DashboardPage";

const ALLOWED_EMAIL = "adrianhalim@email.com";
const ALLOWED_PASSWORD = "1234567";
const AUTH_STORAGE_KEY = "mindful_living_auth";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginSubmit = ({ email, password }) => {
    if (isSigningIn) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ALLOWED_EMAIL && password === ALLOWED_PASSWORD) {
      setErrorMessage("");
      setIsSigningIn(true);
      window.setTimeout(() => {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        setIsAuthenticated(true);
        setIsSigningIn(false);
        navigate("/dashboard", { replace: true });
      }, 1200);
      return;
    }

    setIsSigningIn(false);
    setErrorMessage("Email atau password salah.");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setIsSigningIn(false);
    setErrorMessage("");
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <main className="page">
              <div className="bg-shape bg-shape-top" />
              <div className="bg-shape bg-shape-bottom" />
              <LoginCard
                onSubmit={handleLoginSubmit}
                onForgotPassword={() => console.log("Forgot password clicked")}
                errorMessage={errorMessage}
                isSubmitting={isSigningIn}
              />
            </main>
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
