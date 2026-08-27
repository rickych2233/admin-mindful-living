import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MediaLibraryPage from "./MediaLibraryPage";
import RolesPermissionsPageView from "./RolesPermissionsPage";
import ResourcesPage from "./ResourcesPage";
import SidebarNav from "./SidebarNav";
import { sidebarMainItems } from "./sidebarItems";

import { DashboardOverview } from "./pages/DashboardOverview";
import { ChapterManagementPage } from "./pages/ChapterManagementPage";
import { PracticeManagementPage } from "./pages/PracticeManagementPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import CommunityPage from "./pages/CommunityPage";
import NotesBookmarksPage from "./pages/NotesBookmarksPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

import { dashboardSegmentByItemId } from "./data/constants";
import { LogoutModal } from "./LogoutModal";
import { UserProfileModal } from "./UserProfileModal";

function DashboardPage({ onLogout = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const pathAfterDashboard = location.pathname.replace(/^\/dashboard\/?/, "");
  const activeSegment = pathAfterDashboard.split("/")[0];
  const activeItem = sidebarMainItems.find((item) => dashboardSegmentByItemId[item.id] === activeSegment)?.id ?? "dashboard";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleSelectItem = (itemId) => {
    const nextSegment = dashboardSegmentByItemId[itemId];
    navigate(nextSegment ? `/dashboard/${nextSegment}` : "/dashboard");
  };

  const activeTitle = useMemo(
    () => sidebarMainItems.find((item) => item.id === activeItem)?.label ?? "Dashboard",
    [activeItem]
  );

  return (
    <section className="dashboard-shell">
      {isSidebarOpen && (
        <button
          type="button"
          className="dashboard-scrim"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SidebarNav
        activeItem={activeItem}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectItem={handleSelectItem}
        onLogout={() => setIsLogoutModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={{
          name: "Adrian Halim",
          email: "adrianhalim@email.com",
          avatar: "https://i.pravatar.cc/150?img=11"
        }}
      />

      <div className="dashboard-main">
        <div className="dashboard-mobile-bar">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-dot brand-dot-left" />
              <span className="brand-dot brand-dot-right" />
            </span>
            <strong>Mindful Living</strong>
          </div>
        </div>

        {activeItem === "dashboard" && <DashboardOverview />}
        {activeItem === "chapter" && <ChapterManagementPage />}
        {activeItem === "practice" && <PracticeManagementPage />}
        {activeItem === "user" && <UserManagementPage />}
        {activeItem === "community" && <CommunityPage />}
        {activeItem === "notes" && <NotesBookmarksPage />}
        {activeItem === "resources" && <ResourcesPage />}
        {activeItem === "roles" && <RolesPermissionsPageView />}
        {activeItem === "media" && <MediaLibraryPage />}
        {activeItem !== "dashboard" &&
          activeItem !== "chapter" &&
          activeItem !== "practice" &&
          activeItem !== "user" &&
          activeItem !== "community" &&
          activeItem !== "notes" &&
          activeItem !== "resources" &&
          activeItem !== "roles" &&
          activeItem !== "media" && <PlaceholderPage title={activeTitle} />}
      </div>
    </section>
  );
}

export default DashboardPage;