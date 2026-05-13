/**
 * Clean Sidebar Navigation Component
 * Uses global theme variables for consistent styling
 */
import React from "react";
import { sidebarMainItems, sidebarFooterItem } from "./sidebarItems";
import "./SidebarNavClean.css";

function Icon({ type }) {
  const paths = {
    grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
    book: "M5.5 5.5a2 2 0 0 1 2-2H20v15H7.5a2 2 0 0 0-2 .5V5.5Zm0 0v13a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2Zm5 1.5h7M10.5 10h7",
    clipboard: "M9 4h6a2 2 0 0 1 2 2v14H7V6a2 2 0 0 1 2-2Zm-1 6h8m-8 4h6M10 2h4",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
    users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-1a2.5 2.5 0 1 0 0-5M3 20a6 6 0 0 1 12 0m2 0a5 5 0 0 1 4-4.9",
    note: "M7 4.5h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Zm3.5 0V3h3v1.5M8.5 9h5M8.5 12h7M8.5 15h4.5",
    folder: "M3.5 7.5h5l1.5 2h9v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z",
    shield: "M12 3.5 18 6v5.5c0 4-2.7 7-6 9-3.3-2-6-5-6-9V6l6-2.5Zm-2 8.5 1.7 1.7L14.8 10.6",
    layers: "M12 4 4 8l8 4 8-4-8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4",
    logout: "M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m3-5 4-4-4-4m-6 4h10",
  };

  return (
    <svg
      className="sidebar-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
    >
      <path d={paths[type]} />
    </svg>
  );
}

function SidebarNavClean({
  activeItem = "dashboard",
  isOpen = false,
  onClose = () => {},
  onSelectItem = () => {},
  onLogout = () => {},
  userProfile = {
    name: "Adrian Halim",
    email: "adrianhalim@email.com",
    avatar: null,
  },
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${isOpen ? " is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar-nav${isOpen ? " is-open" : ""}`}>
        <div className="sidebar-content">
          {/* Header with brand and close button */}
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="brand-mark" aria-hidden="true">
                <span className="brand-dot brand-dot-left" />
                <span className="brand-dot brand-dot-right" />
              </div>
              <strong className="brand-name">Mindful Living</strong>
            </div>

            <button
              type="button"
              className="sidebar-close"
              aria-label="Close navigation"
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* User profile section */}
          <div className="sidebar-profile">
            <div className="profile-avatar" aria-hidden="true">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="" />
              ) : (
                <Icon type="user" />
              )}
            </div>
            <div className="profile-info">
              <p className="profile-name">{userProfile.name}</p>
              <p className="profile-email">{userProfile.email}</p>
            </div>
          </div>

          {/* Main navigation menu */}
          <nav className="sidebar-menu" aria-label="Sidebar menu">
            {sidebarMainItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`menu-item${activeItem === item.id ? " is-active" : ""}`}
                aria-current={activeItem === item.id ? "page" : undefined}
                onClick={() => onSelectItem(item.id)}
              >
                <Icon type={item.icon} />
                <span className="menu-item-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer with logout */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="menu-item menu-item-logout"
            onClick={onLogout}
          >
            <Icon type={sidebarFooterItem.icon} />
            <span className="menu-item-label">{sidebarFooterItem.label}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default SidebarNavClean;