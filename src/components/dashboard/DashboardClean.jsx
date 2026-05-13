/**
 * Clean Dashboard Component
 * Demonstrates usage of clean sidebar with global theme
 */
import React, { useState, useEffect } from "react";
import SidebarNavClean from "./SidebarNavClean";
import ThemeSwitcher from "./ThemeSwitcher";
import { initializeTheme } from "../../styles/themes";
import "./DashboardClean.css";

function DashboardClean() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    const savedTheme = localStorage.getItem("dashboard-theme") || "default";
    setCurrentTheme(savedTheme);
  }, []);

  const handleSelectItem = (itemId) => {
    setActiveItem(itemId);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your logout logic here
  };

  const handleThemeChange = (themeKey) => {
    setCurrentTheme(themeKey);
  };

  return (
    <div className="dashboard-page-clean">
      {/* Clean Sidebar with Global Theme */}
      <SidebarNavClean
        activeItem={activeItem}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectItem={handleSelectItem}
        onLogout={handleLogout}
        userProfile={{
          name: "Adrian Halim",
          email: "adrianhalim@email.com",
          avatar: null, // Add avatar URL if available
        }}
      />

      {/* Main Content Area */}
      <main className="dashboard-main-clean">
        {/* Mobile Header */}
        <header className="dashboard-mobile-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-dot brand-dot-left" />
              <span className="brand-dot brand-dot-right" />
            </span>
            <strong>Mindful Living</strong>
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </header>

        {/* Desktop Header with Theme Switcher */}
        <header className="dashboard-desktop-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">

          {/* Example Cards Using Theme Variables */}
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total Users</p>
              <h2 className="stat-value">2,451</h2>
              <div className="stat-trend positive">+12.5%</div>
            </div>

            <div className="stat-card">
              <p className="stat-label">Active Sessions</p>
              <h2 className="stat-value">847</h2>
              <div className="stat-trend positive">+8.2%</div>
            </div>

            <div className="stat-card">
              <p className="stat-label">Completion Rate</p>
              <h2 className="stat-value">73%</h2>
              <div className="stat-trend negative">-2.4%</div>
            </div>

            <div className="stat-card">
              <p className="stat-label">Avg. Duration</p>
              <h2 className="stat-value">24m</h2>
              <div className="stat-trend positive">+5.1%</div>
            </div>
          </div>

          {/* Content Section */}
          <section className="content-section">
            <h3 className="section-title">Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📚</div>
                <div className="activity-details">
                  <p className="activity-title">New chapter completed</p>
                  <p className="activity-time">2 minutes ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">👥</div>
                <div className="activity-details">
                  <p className="activity-title">5 new users registered</p>
                  <p className="activity-time">15 minutes ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-details">
                  <p className="activity-title">New discussion started</p>
                  <p className="activity-time">1 hour ago</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardClean;