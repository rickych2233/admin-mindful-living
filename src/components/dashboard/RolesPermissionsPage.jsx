import React, { useEffect, useState } from "react";
import "./roles.css";
import {
  useRolesCollection,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  assignUser,
  removeUser,
} from "./utils/roleUtils";
import { useUsersCollection } from "./utils/userUtils";

const permissionSections = [
  {
    id: "dashboard",
    label: "DASHBOARD",
    items: [{ id: "view-dashboard", title: "View Dashboard", description: "Stats and metrics overview" }],
  },
  {
    id: "chapter",
    label: "CHAPTER MANAGEMENT",
    items: [
      { id: "view-chapter", title: "View Chapter" },
      { id: "edit-chapters", title: "Add / Edit Chapters & Sections" },
      { id: "delete-chapters", title: "Delete Chapters & Sections" },
    ],
  },
  {
    id: "practice",
    label: "PRACTICE MANAGEMENT",
    items: [
      { id: "view-practice", title: "View Practice Management" },
      { id: "edit-practice", title: "Add / Edit Practice, Sessions & Categories" },
      { id: "delete-practice", title: "Delete Practice, Sessions & Categories" },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    items: [
      { id: "edit-resources", title: "Add / Edit Resources" },
      { id: "delete-resources", title: "Delete Resources" },
      { id: "approve-suggestions", title: "Approve/Reject User Suggestions" },
    ],
  },
  {
    id: "media-library",
    label: "MEDIA LIBRARY",
    items: [
      { id: "download-media", title: "Download Media" },
      { id: "delete-media", title: "Delete Media" },
    ],
  },
  {
    id: "community",
    label: "COMMUNITY",
    items: [
      { id: "view-community", title: "View Discussion, Reported & Categories" },
      { id: "edit-community", title: "Add / Edit Categories" },
      { id: "delete-community", title: "Delete Categories" },
    ],
  },
  {
    id: "notes",
    label: "NOTES & BOOKMARKS",
    items: [
      { id: "view-notes", title: "View Notes, Bookmarks & Categories" },
      { id: "edit-notes", title: "Add / Edit Categories" },
      { id: "delete-notes", title: "Delete Categories" },
    ],
  },
  {
    id: "user",
    label: "USER MANAGEMENT",
    items: [
      { id: "view-users", title: "View User Details" },
      {
        id: "mark-user-inactive",
        title: "Mark User as Inactive",
        description: "Soft-disable user access without deleting data",
      },
    ],
  },
  {
    id: "roles",
    label: "ROLES & PERMISSIONS",
    items: [
      { id: "view-roles", title: "View Roles" },
      { id: "edit-roles", title: "Create / Edit Roles" },
      { id: "delete-roles", title: "Delete Roles" },
    ],
  },
];

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.1" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function SortIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m8 10 4-4 4 4" />
      <path d="m16 14-4 4-4-4" />
    </svg>
  );
}

function RemoveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r=".8" />
    </svg>
  );
}

function formatAssignedUsers(amount) {
  return `${amount} user listed`;
}

const btnPrimary = {
  background: "#795289",
  color: "#FFF",
  border: "none",
  padding: "10px 20px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: "500",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

function RolesPermissionsPage() {
  const { rows: roles, isLoading, error, refetch } = useRolesCollection();
  const { rows: users } = useUsersCollection();

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activeTab, setActiveTab] = useState("role-permissions");
  const [draftPermissionKeys, setDraftPermissionKeys] = useState([]);
  const [draftName, setDraftName] = useState("");
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Keep selection valid as roles load/change.
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].apiId ?? roles[0].id);
    }
    if (selectedRoleId !== null && !roles.some((r) => (r.apiId ?? r.id) === selectedRoleId)) {
      setSelectedRoleId(roles[0]?.apiId ?? roles[0]?.id ?? null);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => (r.apiId ?? r.id) === selectedRoleId) ?? null;

  // Sync the local draft (name + permissions) only when the selected role changes,
  // so refetches (e.g. assign/remove user) do not wipe unsaved toggle edits.
  useEffect(() => {
    if (selectedRole) {
      setDraftPermissionKeys([...(selectedRole.permissionKeys || [])]);
      setDraftName(selectedRole.name || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId]);

  // Toast auto-dismiss.
  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (title, message) => setToast({ title, message });

  const isDirty =
    !!selectedRole &&
    (draftName.trim() !== selectedRole.name ||
      JSON.stringify([...draftPermissionKeys].sort()) !==
        JSON.stringify([...(selectedRole.permissionKeys || [])].sort()));

  const togglePermission = (key) => {
    setDraftPermissionKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!selectedRole || selectedRole.apiId == null || !isDirty) return;
    setSaving(true);
    try {
      if (draftName.trim() && draftName.trim() !== selectedRole.name) {
        await updateRole(selectedRole.apiId, { name: draftName.trim() });
      }
      await updateRolePermissions(selectedRole.apiId, draftPermissionKeys);
      await refetch();
      showToast("Change Saved", "You have successfully saved a change.");
    } catch (e) {
      showToast("Save Failed", e?.message || "Gagal menyimpan perubahan");
      setDraftPermissionKeys([...(selectedRole.permissionKeys || [])]);
      setDraftName(selectedRole.name || "");
    } finally {
      setSaving(false);
    }
  };

  const saveNewRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    try {
      const res = await createRole({ name, permissionKeys: ["view-dashboard"] });
      const newId = res?.role?.id;
      await refetch();
      if (newId != null) setSelectedRoleId(newId);
      setIsAddRoleModalOpen(false);
      setNewRoleName("");
      showToast("New Role Added", `You have successfully added the role "${name}".`);
    } catch (e) {
      showToast("Add Role Failed", e?.message || "Gagal menambah role");
    }
  };

  const handleAssignUser = async (user) => {
    if (!selectedRole || selectedRole.apiId == null) return;
    try {
      await assignUser(selectedRole.apiId, user.apiId ?? user.id);
      await refetch();
      setIsAssignUserOpen(false);
      showToast("User Assigned", `${user.name} was added to ${selectedRole.name}.`);
    } catch (e) {
      showToast("Assign Failed", e?.message || "Gagal menambah user");
    }
  };

  const handleRemoveUser = async (user) => {
    if (!selectedRole || selectedRole.apiId == null) return;
    try {
      await removeUser(selectedRole.apiId, user.apiId ?? user.id);
      await refetch();
      showToast("User Removed", `${user.name} was removed from ${selectedRole.name}.`);
    } catch (e) {
      showToast("Remove Failed", e?.message || "Gagal menghapus user");
    }
  };

  const handleDeleteRole = async () => {
    if (!confirmDelete || confirmDelete.apiId == null) return;
    try {
      await deleteRole(confirmDelete.apiId);
      await refetch();
      setSelectedRoleId(null);
      setConfirmDelete(null);
      showToast("Role Deleted", `${confirmDelete.name} has been deleted.`);
    } catch (e) {
      showToast("Delete Failed", e?.message || "Gagal menghapus role");
    }
  };

  const assignedIds = new Set((selectedRole?.assignedUsers || []).map((u) => u.id));
  const assignableUsers = (users || []).filter((u) => u.id != null && !assignedIds.has(u.id));

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Roles &amp; Permissions</h1>
        <p>Manage all access &amp; permission in the system</p>
      </header>

      <section className="chapter-page roles-page">
        <div className="roles-layout">
          <aside className="roles-list-card">
            <div className="roles-list-header">
              <div>
                <h2>List of Roles</h2>
                <p>Total {roles.length} roles defined</p>
              </div>

              <button
                type="button"
                className="roles-add-role-btn"
                onClick={() => setIsAddRoleModalOpen(true)}
                style={{
                  background: "transparent",
                  color: "#795289",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span style={{ fontSize: "16px" }}>+</span> Add Role
              </button>
            </div>

            <div
              className="roles-list-body"
              style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", flex: 1, overflowY: "auto" }}
            >
              {isLoading && (
                <div className="chapter-empty-state roles-empty-state">
                  <p>Loading roles...</p>
                </div>
              )}
              {!isLoading && error && (
                <div className="chapter-empty-state roles-empty-state">
                  <p>{error}</p>
                </div>
              )}
              {!isLoading &&
                !error &&
                roles.map((role) => {
                  const isActive = (role.apiId ?? role.id) === selectedRoleId;
                  return (
                    <article
                      key={role.id}
                      className={`roles-list-item${isActive ? " is-active" : ""}`}
                      onClick={() => setSelectedRoleId(role.apiId ?? role.id)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isActive ? "#FBF8FE" : "transparent",
                        color: isActive ? "#795289" : "#4A5568",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: isActive ? "600" : "500" }}>
                        {role.name}
                      </span>
                    </article>
                  );
                })}

              {!isLoading && !error && roles.length === 0 && (
                <div className="chapter-empty-state roles-empty-state">
                  <p>No roles available.</p>
                </div>
              )}
            </div>
          </aside>

          <section className="roles-detail-card" style={{ flex: 1, position: "relative" }}>
            {selectedRole ? (
              <div style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="roles-detail-header" style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#171e2b", margin: 0 }}>
                    {selectedRole.name}
                  </h2>
                </div>

                <div
                  className="roles-tabs"
                  style={{
                    display: "flex",
                    gap: "24px",
                    borderBottom: "1px solid #E3E7ED",
                    marginBottom: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("role-info")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0 0 12px 0",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: activeTab === "role-info" ? "#171e2b" : "#A0AEC0",
                      borderBottom:
                        activeTab === "role-info" ? "2px solid #795289" : "2px solid transparent",
                      position: "relative",
                      top: "1px",
                    }}
                  >
                    Role Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("role-permissions")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0 0 12px 0",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: activeTab === "role-permissions" ? "#171e2b" : "#A0AEC0",
                      borderBottom:
                        activeTab === "role-permissions" ? "2px solid #795289" : "2px solid transparent",
                      position: "relative",
                      top: "1px",
                    }}
                  >
                    Role Permissions
                  </button>
                </div>

                {activeTab === "role-permissions" && (
                  <div className="roles-permission-groups" style={{ flex: 1, overflowY: "auto" }}>
                    {permissionSections.map((section) => (
                      <div
                        key={section.id}
                        className="roles-permission-group"
                        style={{ marginBottom: "32px" }}
                      >
                        <h3
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#795289",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "16px",
                          }}
                        >
                          {section.label}
                        </h3>

                        <div
                          className="roles-permission-list"
                          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                        >
                          {section.items.map((item) => {
                            const on = draftPermissionKeys.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className="roles-permission-row"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingBottom: "16px",
                                  borderBottom: "1px solid #F1F4F9",
                                }}
                              >
                                <div className="roles-permission-copy">
                                  <strong
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      color: "#171e2b",
                                      display: "block",
                                    }}
                                  >
                                    {item.title}
                                  </strong>
                                  {item.description && (
                                    <p style={{ fontSize: "12px", color: "#A0AEC0", margin: "4px 0 0 0" }}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  className={`roles-switch${on ? " is-on" : ""}`}
                                  aria-pressed={on}
                                  aria-label={`${on ? "Disable" : "Enable"} ${item.title}`}
                                  onClick={() => togglePermission(item.id)}
                                >
                                  <span />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "role-info" && (
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div style={{ marginBottom: "32px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#171e2b",
                          marginBottom: "8px",
                        }}
                      >
                        Roles Name <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Enter role name"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #E3E7ED",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          color: "#171e2b",
                        }}
                      />
                      {selectedRole.isSystem && (
                        <p style={{ fontSize: "12px", color: "#A0AEC0", margin: "8px 0 0 0" }}>
                          This is a system role and cannot be deleted.
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        position: "relative",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "#A0AEC0" }}>
                        {formatAssignedUsers(selectedRole.assignedUsers.length)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAssignUserOpen((v) => !v)}
                        style={{
                          background: "#795289",
                          color: "#FFF",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>+</span> Assign User
                      </button>

                      {isAssignUserOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            width: "280px",
                            maxHeight: "260px",
                            overflowY: "auto",
                            background: "#FFF",
                            border: "1px solid #E3E7ED",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                            zIndex: 20,
                          }}
                        >
                          {assignableUsers.length === 0 && (
                            <div style={{ padding: "16px", fontSize: "13px", color: "#A0AEC0" }}>
                              No users available to assign.
                            </div>
                          )}
                          {assignableUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleAssignUser(user)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                background: "transparent",
                                border: "none",
                                borderBottom: "1px solid #F1F4F9",
                                padding: "10px 16px",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <span style={{ fontSize: "13px", fontWeight: "500", color: "#171e2b" }}>
                                {user.name}
                              </span>
                              <span style={{ fontSize: "12px", color: "#A0AEC0" }}>{user.email}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ border: "1px solid #E3E7ED", borderRadius: "12px", overflow: "hidden" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.5fr 2fr 100px",
                          padding: "12px 16px",
                          background: "#F9FAFC",
                          borderBottom: "1px solid #E3E7ED",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#80899a",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          Name <SortIcon style={{ width: "14px", height: "14px" }} />
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          Email <SortIcon style={{ width: "14px", height: "14px" }} />
                        </span>
                        <span>Action</span>
                      </div>

                      {selectedRole.assignedUsers.map((user) => (
                        <div
                          key={user.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 2fr 100px",
                            padding: "12px 16px",
                            alignItems: "center",
                            borderBottom: "1px solid #F1F4F9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "#F4F6F9",
                                  color: "#929bac",
                                  display: "grid",
                                  placeItems: "center",
                                }}
                              >
                                <UserIcon style={{ width: "18px", height: "18px" }} />
                              </div>
                            )}
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#171e2b" }}>
                              {user.name}
                            </span>
                          </div>
                          <span style={{ fontSize: "14px", color: "#171e2b" }}>{user.email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(user)}
                            style={{
                              background: "transparent",
                              border: "1px solid #E3E7ED",
                              color: "#A0AEC0",
                              borderRadius: "999px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                              justifyContent: "center",
                            }}
                          >
                            <RemoveIcon style={{ width: "12px", height: "12px" }} />
                            Remove
                          </button>
                        </div>
                      ))}

                      {selectedRole.assignedUsers.length === 0 && (
                        <div
                          style={{
                            padding: "32px",
                            textAlign: "center",
                            color: "#A0AEC0",
                            fontSize: "14px",
                          }}
                        >
                          No users assigned to this role.
                        </div>
                      )}
                    </div>

                    {!selectedRole.isSystem && (
                      <div style={{ marginTop: "24px" }}>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(selectedRole)}
                          style={{
                            background: "transparent",
                            border: "1px solid #FED7D7",
                            color: "#E53E3E",
                            borderRadius: "999px",
                            padding: "8px 16px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <TrashIcon style={{ width: "14px", height: "14px" }} />
                          Delete Role
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid #E3E7ED", flex: "none" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    style={{
                      ...(isDirty && !saving ? btnPrimary : {}),
                      background: isDirty && !saving ? "#795289" : "#F4F6F9",
                      color: isDirty && !saving ? "#FFF" : "#A0AEC0",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: isDirty && !saving ? "pointer" : "default",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <CheckIcon style={{ width: "16px", height: "16px" }} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="chapter-empty-state roles-empty-detail">
                <p>{isLoading ? "Loading roles..." : "Select a role to view permissions."}</p>
              </div>
            )}
          </section>
        </div>

        {toast && (
          <div
            className="roles-toast"
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              background: "#171e2b",
              color: "#FFF",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              border: "none",
              zIndex: 1100,
              maxWidth: "340px",
            }}
          >
            <div style={{ color: "#2ECC71", marginTop: "2px", flexShrink: 0 }}>
              <CheckIcon style={{ width: "18px", height: "18px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#FFF",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {toast.title}
                </strong>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => setToast(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#A0AEC0",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#A0AEC0", lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>
          </div>
        )}
      </section>

      {isAddRoleModalOpen && (
        <div
          className="roles-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            background: "rgba(25, 31, 42, 0.28)",
          }}
          onClick={() => setIsAddRoleModalOpen(false)}
        >
          <div
            style={{
              background: "#FFF",
              borderRadius: "16px",
              padding: "0",
              width: "380px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#171e2b" }}>
                Add Role
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#A0AEC0",
                  padding: 0,
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: "0 24px 24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  marginBottom: "8px",
                  color: "#171e2b",
                  fontWeight: "500",
                }}
              >
                Roles Name <span style={{ color: "#E53E3E" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #E3E7ED",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  color: "#171e2b",
                  marginBottom: "24px",
                }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#F4F6F9",
                    color: "#4A5568",
                    border: "none",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveNewRole}
                  disabled={!newRoleName.trim()}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: newRoleName.trim() ? "#795289" : "#F4F6F9",
                    color: newRoleName.trim() ? "#FFF" : "#A0AEC0",
                    border: "none",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: newRoleName.trim() ? "pointer" : "default",
                  }}
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="roles-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            background: "rgba(25, 31, 42, 0.28)",
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            style={{
              background: "#FFF",
              borderRadius: "16px",
              padding: "28px 24px",
              width: "360px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "#FFF4F4",
                color: "#E53E3E",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AlertIcon style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "600", color: "#171e2b" }}>
              Delete Role
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#718096", lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot
              be undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#F4F6F9",
                  color: "#4A5568",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#E53E3E",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RolesPermissionsPage;
