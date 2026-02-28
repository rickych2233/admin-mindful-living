import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import { sidebarMainItems } from "./sidebarItems";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL || `${API_BASE_URL}/users`;

const fallbackChapterRows = [
  {
    id: 1,
    title: "Introduction to Mindful Living",
    description:
      "Learn the foundations of mindfulness and begin your journey toward a calmer, more aware life.",
    status: "Published",
  },
  {
    id: 2,
    title: "Building Positive Daily Habits",
    description:
      "Cultivate routines that reinforce mindfulness and well-being, transforming your everyday life.",
    status: "Published",
  },
  {
    id: 3,
    title: "Managing Stress & Emotions",
    description:
      "Discover practical techniques to handle daily pressures and emotional responses with mindfulness.",
    status: "Published",
  },
  {
    id: 4,
    title: "Finding Purpose & Inner Motivation",
    description:
      "Explore mindfulness techniques to unlock your inner drive and discover what truly motivates you.",
    status: "Published",
  },
  {
    id: 5,
    title: "Breathing Exercises for Beginners",
    description:
      "Master the basics of mindful breathing to reduce stress and enhance your overall well-being.",
    status: "Published",
  },
  {
    id: 6,
    title: "Deep Sleep Meditation Techniques",
    description:
      "Explore techniques for achieving deep, restful sleep through guided meditation and relaxation practices.",
    status: "Published",
  },
  {
    id: 7,
    title: "Guided Meditation for Anxiety Relief",
    description:
      "Soothe anxiety with targeted meditation techniques designed to calm your mind and restore inner peace.",
    status: "Published",
  },
];

const fallbackRoleRows = [
  { roleName: "Super Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: false },
  { roleName: "General Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Book Author", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Community Admin", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
];

function normalizeUser(item) {
  const donationRaw = item.donation ?? item.donationAmount ?? item.donation_amount ?? item.amount;
  const donation =
    donationRaw === null || donationRaw === undefined || donationRaw === ""
      ? "-"
      : typeof donationRaw === "number"
      ? `$${donationRaw.toFixed(2)}`
      : String(donationRaw);

  return {
    name: item.name || item.fullName || "-",
    email: item.email || "-",
    donation,
    lastLogin: item.lastLogin || item.last_login || item.created_at || "-",
  };
}

function useUsersCollection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(USERS_API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const rawRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.users)
          ? payload.users
          : [];
        const normalizedRows = rawRows.map(normalizeUser);
        setRows(normalizedRows);
      } catch (err) {
        if (err.name !== "AbortError") {
          setRows([]);
          setError("Gagal ambil data users dari API.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      controller.abort();
    };
  }, []);

  return { rows, isLoading, error };
}

function DashboardOverview() {
  return (
    <>
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Adrian! • Tue, 14 Jan 2026</p>
      </header>

      <div className="dashboard-grid">
        <article className="dash-card">
          <div className="card-top-row">
            <div>
              <p className="card-label">Total Users</p>
              <h2>24 user</h2>
              <p className="card-trend">
                + 5 user <span>vs last week</span>
              </p>
            </div>
            <button type="button" className="pill-button">Weekly</button>
          </div>
          <svg className="line-chart" viewBox="0 0 420 170" role="img" aria-label="User trend chart">
            <path className="line-fill" d="M0 112 C54 92, 75 85, 104 93 C140 101, 165 112, 194 118 C232 124, 276 98, 312 84 C352 68, 385 53, 420 40 L420 170 L0 170 Z" />
            <path className="line-stroke" d="M0 112 C54 92, 75 85, 104 93 C140 101, 165 112, 194 118 C232 124, 276 98, 312 84 C352 68, 385 53, 420 40" />
          </svg>
          <div className="axis-labels">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </article>

        <article className="dash-card">
          <div className="card-top-row">
            <div>
              <p className="card-label">Total Revenue</p>
              <h2>$24,249.24</h2>
              <p className="card-trend">
                ↑ 5.6% <span>vs last month</span>
              </p>
            </div>
            <button type="button" className="pill-button">Monthly</button>
          </div>
          <svg className="line-chart" viewBox="0 0 420 170" role="img" aria-label="Revenue trend chart">
            <path className="line-fill" d="M0 108 C35 76, 62 86, 85 95 C108 103, 130 86, 150 98 C176 115, 194 132, 222 110 C248 89, 270 58, 301 72 C332 86, 350 74, 376 82 C396 89, 409 78, 420 66 L420 170 L0 170 Z" />
            <path className="line-stroke" d="M0 108 C35 76, 62 86, 85 95 C108 103, 130 86, 150 98 C176 115, 194 132, 222 110 C248 89, 270 58, 301 72 C332 86, 350 74, 376 82 C396 89, 409 78, 420 66" />
          </svg>
          <div className="axis-labels">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </article>

        <article className="dash-card">
          <p className="card-label">Overall Chapter Progress</p>
          <h2>85.35%</h2>
          <div className="chapter-bars">
            {[
              ["Chapter 1", 95],
              ["Chapter 2", 90],
              ["Chapter 3", 88],
              ["Chapter 4", 90],
              ["Chapter 5", 92],
              ["Chapter 6", 91],
              ["Chapter 7", 80],
            ].map(([label, value]) => (
              <div key={label} className="bar-group">
                <span className="bar-value">{value}%</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${value}%` }} />
                </div>
                <span className="bar-label">{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dash-card">
          <p className="card-label">Top 5 Popular Sections</p>
          <div className="switch-row">
            <button type="button" className="chip chip-active">Total Access</button>
            <button type="button" className="chip">Total Completion</button>
          </div>
          <div className="donut-wrap" aria-hidden="true" />
          <p className="legend-text">
            • What is Mindfulness? • Breathing Awareness... • Why Mindfulness Matters...
            • Conclusion Chapter 1 • Being Present in Daily...
          </p>
        </article>
      </div>
    </>
  );
}

function ChapterManagementPage() {
  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Chapter Management</h1>
        <p>Organize the chapters and sections of your book</p>
      </header>

      <section className="chapter-page">
        <div className="chapter-toolbar">
          <div className="chapter-filters">
            <label className="chapter-search" aria-label="Search chapters">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" placeholder="Search chapters..." />
            </label>

            <button type="button" className="chapter-select">
              All Status
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
          </div>

          <button type="button" className="chapter-order-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6v12m0 0-3-3m3 3 3-3M16 18V6m0 0-3 3m3-3 3 3" />
            </svg>
            Change Order
          </button>
        </div>

        <div className="chapter-table-card">
          <div className="chapter-table-head">
            <span>No</span>
            <span className="sortable-head">
              Chapter Name
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Status
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span aria-hidden="true" />
          </div>

          {fallbackChapterRows.map((chapter) => (
            <article key={chapter.id} className="chapter-row">
              <div className="chapter-no">{chapter.id}</div>

              <div className="chapter-main-cell">
                <div className="chapter-thumb" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="8" cy="8" r="2" />
                    <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                  </svg>
                </div>
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.description}</p>
                </div>
              </div>

              <div className="chapter-status">{chapter.status}</div>

              <button type="button" className="chapter-edit-btn" aria-label={`Edit ${chapter.title}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function UserManagementPage() {
  const { rows: userRows, isLoading, error } = useUsersCollection();

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>User Management</h1>
        <p>Monitor all user activity in the platform</p>
      </header>

      <section className="chapter-page">
        {(isLoading || error) && (
          <p className="api-state-text">
            {isLoading ? "Loading data..." : error}
          </p>
        )}
        <div className="user-toolbar">
          <label className="chapter-search user-search" aria-label="Search users">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Search user..." />
          </label>
        </div>

        <div className="user-table-card">
          <div className="user-table-head">
            <span className="sortable-head">
              Full Name
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Email
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Donation Amount
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Last Login
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
          </div>

          {userRows.map((user) => (
            <article key={user.email} className="user-row">
              <div className="user-name-cell">
                <div className="user-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.1" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </div>
              <span className="user-email">{user.email}</span>
              <span className="user-donation">{user.donation}</span>
              <span className="user-last-login">{user.lastLogin}</span>
            </article>
          ))}

          {!isLoading && !error && userRows.length === 0 && (
            <p className="api-state-text user-empty-text">Belum ada data users dari API.</p>
          )}
        </div>
      </section>
    </>
  );
}

function RolesPermissionsPage() {
  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Roles & Permissions</h1>
        <p>Manage all access & permission in the system</p>
      </header>

      <section className="chapter-page">
        <div className="roles-toolbar">
          <div className="chapter-filters">
            <label className="chapter-search" aria-label="Search role name">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" placeholder="Search role name..." />
            </label>

            <button type="button" className="chapter-select">
              All Status
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
          </div>

          <button type="button" className="roles-add-btn">
            <span>+</span>
            Add Role
          </button>
        </div>

        <div className="roles-table-card">
          <div className="roles-table-head">
            <span className="roles-checkbox" aria-hidden="true" />
            <span className="sortable-head">
              Role Name
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Status
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Last Update
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span aria-hidden="true" />
          </div>

          {fallbackRoleRows.map((role) => (
            <article key={role.roleName} className="roles-row">
              <span className="roles-checkbox" aria-hidden="true" />
              <span className="roles-name">{role.roleName}</span>
              <span className={`roles-status ${role.status === "Active" ? "is-active" : "is-inactive"}`}>
                {role.status}
              </span>
              <span className="roles-date">{role.lastUpdate}</span>
              <div className="roles-actions">
                <button type="button" className="roles-icon-btn" aria-label={`Edit ${role.roleName}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                  </svg>
                </button>
                {role.canDelete && (
                  <button type="button" className="roles-icon-btn" aria-label={`Delete ${role.roleName}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>{title}</h1>
        <p>This section is ready for implementation.</p>
      </header>
      <section className="chapter-page placeholder-page">
        <p>{title} content is not available yet.</p>
      </section>
    </>
  );
}

const dashboardSegmentByItemId = {
  dashboard: "",
  chapter: "chapter",
  practice: "practice",
  user: "user",
  community: "community",
  resources: "resources",
  roles: "roles",
};

function DashboardPage({ onLogout = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathAfterDashboard = location.pathname.replace(/^\/dashboard\/?/, "");
  const activeSegment = pathAfterDashboard.split("/")[0];
  const activeItem = sidebarMainItems.find((item) => dashboardSegmentByItemId[item.id] === activeSegment)?.id ?? "dashboard";

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
      <SidebarNav activeItem={activeItem} onSelectItem={handleSelectItem} onLogout={onLogout} />

      <div className="dashboard-main">
        {activeItem === "dashboard" && <DashboardOverview />}
        {activeItem === "chapter" && <ChapterManagementPage />}
        {activeItem === "user" && <UserManagementPage />}
        {activeItem === "roles" && <RolesPermissionsPage />}
        {activeItem !== "dashboard" && activeItem !== "chapter" && activeItem !== "user" && activeItem !== "roles" && (
          <PlaceholderPage title={activeTitle} />
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
