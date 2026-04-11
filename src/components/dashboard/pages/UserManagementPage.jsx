import React, { useEffect, useMemo, useState } from "react";
import { useUsersCollection, updateUserStatusViaApi } from "../utils/userUtils";
import { UserAvatar } from "../utils/commonComponents.jsx";

const userManagementMetrics = [
  {
    label: "Total Registered",
    value: "4821 user",
    chip: "+ 5 user",
    note: "vs last month",
  },
  {
    label: "Community Supporters",
    value: "1204",
    chip: "25%",
    note: "of users",
  },
  {
    label: "Active Last Day",
    value: "2,341",
    chip: "\u2191 5%",
    note: "vs last week",
  },
];

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { rows: apiUserRows, isLoading, error } = useUsersCollection();
  const [userRows, setUserRows] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState(null);

  useEffect(() => {
    setUserRows(apiUserRows);
  }, [apiUserRows]);

  useEffect(() => {
    if (!selectedUserId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedUserId]);

  useEffect(() => {
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
  }, [selectedUserId]);

  const filteredUserRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return userRows.filter((user) => {
      if (normalizedQuery === "") {
        return true;
      }

      return (
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.status.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [userRows, searchQuery]);

  const selectedUser = userRows.find((user) => user.id === selectedUserId) ?? null;

  const handleExportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Language",
      "Biometric",
      "Donation Amount",
      "Last Active",
      "Status",
      "Registered",
      "Chapters Completed",
    ];

    const rows = filteredUserRows.map((user) => [
      user.name,
      user.email,
      user.languageDetail,
      user.biometric,
      user.donationAmount,
      user.lastActiveDetail,
      user.status,
      user.registered,
      user.chaptersCompleted,
    ]);

    const csvContent = [header, ...rows].map((columns) => columns.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const toggleSelectedUserStatus = async () => {
    if (!selectedUser) {
      return;
    }

    const previousStatus = selectedUser.status;
    const nextStatus = previousStatus === "Active" ? "Inactive" : "Active";
    const apiUserId = selectedUser.apiId ?? selectedUser.id;

    setStatusUpdateError("");
    setStatusUpdateSuccess("");
    setStatusUpdatingUserId(selectedUser.id);

    setUserRows((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: nextStatus,
            }
          : user
      )
    );

    try {
      const result = await updateUserStatusViaApi(apiUserId);
      const statusFromApi =
        result?.user?.active === true ? "Active" : result?.user?.active === false ? "Inactive" : null;
      if (statusFromApi) {
        setUserRows((current) =>
          current.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  status: statusFromApi,
                }
              : user
          )
        );
      }
      setStatusUpdateSuccess(result?.message || "Status user berhasil diperbarui.");
    } catch (updateError) {
      setUserRows((current) =>
        current.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                status: previousStatus,
              }
            : user
        )
      );
      setStatusUpdateError(updateError.message || "Gagal update status user.");
    } finally {
      setStatusUpdatingUserId(null);
    }
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>User Management</h1>
        <p>Monitor all user activity in the platform</p>
      </header>

      <section className="chapter-page user-management-page">
        <div className="user-stat-grid">
          {userManagementMetrics.map((metric) => (
            <article key={metric.label} className="metric-card user-stat-card">
              <p className="metric-card-label">{metric.label}</p>
              <h3 className="metric-card-value">{metric.value}</h3>
              <div className="metric-meta">
                <span className="metric-pill">{metric.chip}</span>
                <span className="metric-note">{metric.note}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="user-management-toolbar">
          <label className="chapter-search user-search" aria-label="Search users">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <button type="button" className="user-export-btn" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>

        <div className="user-table-card user-table-card-redesign">
          <div className="user-table-head user-table-head-redesign">
            <span className="sortable-head">
              User
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
              Language
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Biometric
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
              Last Active
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
            <span>Action</span>
          </div>

          {filteredUserRows.map((user) => (
            <article
              key={user.id}
              className="user-row user-row-redesign"
              onClick={() => setSelectedUserId(user.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedUserId(user.id);
                }
              }}
            >
              <div className="user-name-cell">
                <div className="user-avatar user-list-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.1" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </div>

              <span className="user-email">{user.email}</span>
              <span className="user-language-pill">{user.language}</span>

              <span className={`user-biometric-pill ${user.biometric === "On" ? "is-on" : "is-off"}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {user.biometric === "On" ? (
                    <path d="m7 12 3 3 7-7" />
                  ) : (
                    <path d="m8 8 8 8M16 8l-8 8" />
                  )}
                </svg>
                {user.biometric}
              </span>

              <span className="user-donation">{user.donationAmount}</span>
              <span className="user-last-login">{user.lastActive}</span>
              <span className={`user-status-pill ${user.status === "Active" ? "is-active" : "is-inactive"}`}>
                {user.status}
              </span>

              <button
                type="button"
                className="user-view-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedUserId(user.id);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                View
              </button>
            </article>
          ))}

          {isLoading && (
            <div className="chapter-empty-state">
              <p>Loading users...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="chapter-empty-state">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredUserRows.length === 0 && (
            <div className="chapter-empty-state">
              <p>No users match the current search.</p>
            </div>
          )}
        </div>
      </section>

      {selectedUser && (
        <div className="user-profile-overlay" onClick={() => setSelectedUserId(null)}>
          <aside
            className="user-profile-drawer"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="user-profile-header">
              <div>
                <h2>User Profile</h2>
                <p>Full account details &amp; activity</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close user profile" onClick={() => setSelectedUserId(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="user-profile-body">
              <div className="user-profile-summary">
                <div className="user-avatar user-profile-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.1" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>

                <div className="user-profile-title">
                  <h3>{selectedUser.name}</h3>
                  <span className={`user-status-pill ${selectedUser.status === "Active" ? "is-active" : "is-inactive"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="user-profile-grid">
                <div className="user-profile-item">
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Language</span>
                  <strong>{selectedUser.languageDetail}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Biometric</span>
                  <strong>{selectedUser.biometric}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Registered</span>
                  <strong>{selectedUser.registered}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Last Active</span>
                  <strong>{selectedUser.lastActiveDetail}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Chapters Completed</span>
                  <strong>{selectedUser.chaptersCompleted}</strong>
                </div>
                <div className="user-profile-item user-profile-item-wide">
                  <span>Donation Amount</span>
                  <strong>{selectedUser.donationAmount}</strong>
                </div>
              </div>
            </div>

            <div className="user-profile-footer">
              <button
                type="button"
                className="user-status-action-btn"
                onClick={toggleSelectedUserStatus}
                disabled={statusUpdatingUserId === selectedUser.id}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8v4m0 4h.01M10.3 3.7 1.8 18.2A1.4 1.4 0 0 0 3 20.3h18a1.4 1.4 0 0 0 1.2-2.1L13.7 3.7a1.4 1.4 0 0 0-2.4 0Z" />
                </svg>
                {statusUpdatingUserId === selectedUser.id
                  ? "Updating..."
                  : selectedUser.status === "Active"
                  ? "Mark as Inactive"
                  : "Mark as Active"}
              </button>

              <button type="button" className="chapter-primary-btn user-close-btn" onClick={() => setSelectedUserId(null)}>
                Close
              </button>
            </div>
            {statusUpdateError && (
              <p style={{ margin: "10px 4px 0", color: "#b42318", fontSize: "0.875rem" }}>
                {statusUpdateError}
              </p>
            )}
            {statusUpdateSuccess && (
              <p style={{ margin: "10px 4px 0", color: "#067647", fontSize: "0.875rem" }}>
                {statusUpdateSuccess}
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
