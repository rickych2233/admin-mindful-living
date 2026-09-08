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

              <div className="user-row-mobile-pills">
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

                <span className={`user-status-pill ${user.status === "Active" ? "is-active" : "is-inactive"}`}>
                  {user.status}
                </span>
              </div>

              <div className="user-row-mobile-info">
                <div className="user-row-mobile-info-item">
                  <span className="user-mobile-label">Donation</span>
                  <span className="user-donation">{user.donationAmount}</span>
                </div>
                <div className="user-row-mobile-info-item">
                  <span className="user-mobile-label">Last Active</span>
                  <span className="user-last-login">{user.lastActive}</span>
                </div>
              </div>

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
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" /><polyline points="3 7 12 13 21 7" /></svg>
                    {selectedUser.email}
                  </strong>
                </div>
                <div className="user-profile-item">
                  <span>Language</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    {selectedUser.languageDetail}
                  </strong>
                </div>
                <div className="user-profile-item">
                  <span>Biometric Access</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: selectedUser.biometric === "On" ? "#2B9367" : "#667085" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={selectedUser.biometric === "On" ? "#2B9367" : "#667085"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {selectedUser.biometric === "On" ? (
                        <>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </>
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </>
                      )}
                    </svg>
                    {selectedUser.biometric}
                  </strong>
                </div>
                <div className="user-profile-item">
                  <span>Registered</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    {selectedUser.registered}
                  </strong>
                </div>
                <div className="user-profile-item">
                  <span>Last Active</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {selectedUser.lastActiveDetail}
                  </strong>
                </div>
                <div className="user-profile-item">
                  <span>Chapters Completed</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    {selectedUser.chaptersCompleted}
                  </strong>
                </div>
                <div className="user-profile-item user-profile-item-wide">
                  <span>Donation Amount</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#795289" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                      <line x1="12" y1="6" x2="12" y2="18"></line>
                      <path d="M15 9.5H10.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9"></path>
                    </svg>
                    {selectedUser.donationAmount}
                  </strong>
                </div>
              </div>
            </div>

            <div className="user-profile-footer">
              <button
                type="button"
                className="user-status-action-btn"
                onClick={toggleSelectedUserStatus}
                disabled={statusUpdatingUserId === selectedUser.id}
                style={{
                  color: "#795289",
                  background: "#fdfbfe",
                  border: "1px solid #e8e3ed"
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, width: "16px", height: "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
