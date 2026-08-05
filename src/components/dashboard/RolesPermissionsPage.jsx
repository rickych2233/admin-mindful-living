import React, { useEffect, useState } from "react";
import "./roles.css";

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

const allPermissionIds = permissionSections.flatMap((section) => section.items.map((item) => item.id));

function createPermissions(enabledIds = []) {
  return allPermissionIds.reduce((accumulator, permissionId) => {
    accumulator[permissionId] = enabledIds.includes(permissionId);
    return accumulator;
  }, {});
}

const initialRoles = [
  {
    id: "super-admin",
    name: "Super Admin",
    assignedUsers: [
      { id: "adrian-halim", name: "Adrian Halim", email: "adrianhalim@email.com", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" },
      { id: "david-kim", name: "David Kim", email: "davidkim@email.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
    ],
    permissions: createPermissions(allPermissionIds),
    canDelete: false,
  },
  {
    id: "content-editor",
    name: "Content Editor",
    assignedUsers: [
      { id: "marie-laura", name: "Marie Laura", email: "marie.laura@email.com" },
    ],
    permissions: createPermissions([
      "view-dashboard",
      "view-chapter",
      "edit-chapters",
      "view-practice",
      "edit-practice",
    ]),
    canDelete: true,
  },
  {
    id: "viewer",
    name: "Viewer",
    assignedUsers: [
      { id: "camila-cabello", name: "Camila Cabello", email: "camilacc@email.com" },
    ],
    permissions: createPermissions(["view-dashboard", "view-chapter", "view-users", "view-roles"]),
    canDelete: true,
  },
];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 10 4-4 4 4" />
      <path d="m16 14-4 4-4-4" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r=".8" />
    </svg>
  );
}

function formatAssignedUsers(amount) {
  return `${amount} user listed`;
}

function RolesPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoles[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState("role-info");
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!editingRoleId && !deleteRoleId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [deleteRoleId, editingRoleId]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    if (!roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(roles[0]?.id ?? null);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const deleteRole = roles.find((role) => role.id === deleteRoleId) ?? null;
  const isEditMode = Boolean(editingRoleId && editingRoleId !== "new");

  const openAddRoleModal = () => {
    setEditingRoleId("new");
    setRoleForm({
      name: "",
      assignedUsers: [],
    });
  };

  const openEditRoleModal = (role) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      assignedUsers: role.assignedUsers.map((user) => ({ ...user })),
    });
  };

  const closeEditModal = () => {
    setEditingRoleId(null);
    setRoleForm({ name: "", assignedUsers: [] });
  };

  const showToast = (title, message) => {
    setToast({ title, message });
  };

  const togglePermission = (permissionId) => {
    if (!selectedRole) return;

    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permissionId]: !role.permissions[permissionId],
              },
            }
          : role
      )
    );
  };

  const handleRoleNameChange = (event) => {
    if (!selectedRole) return;
    const nextValue = event.target.value;
    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? { ...role, name: nextValue }
          : role
      )
    );
  };

  const removeAssignedUser = (userId) => {
    if (!selectedRole) return;
    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? { ...role, assignedUsers: role.assignedUsers.filter((u) => u.id !== userId) }
          : role
      )
    );
  };

  const saveNewRole = () => {
    const normalizedName = newRoleName.trim();
    if (normalizedName === "") return;

    const nextRoleId = `role-${Date.now()}`;
    const nextRole = {
      id: nextRoleId,
      name: normalizedName,
      assignedUsers: [],
      permissions: createPermissions(["view-dashboard"]),
      canDelete: true,
    };

    setRoles((current) => [...current, nextRole]);
    setSelectedRoleId(nextRoleId);
    setIsAddRoleModalOpen(false);
    setNewRoleName("");
    showToast("New Role Added", "You have successfully added a new role.");
  };

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

              <button type="button" className="roles-add-role-btn" onClick={() => setIsAddRoleModalOpen(true)} style={{ background: "transparent", color: "#795289", border: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer", padding: 0 }}>
                <span style={{ fontSize: "16px" }}>+</span> Add Role
              </button>
            </div>

            <div className="roles-list-body" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              {roles.map((role) => {
                const isActive = role.id === selectedRoleId;

                return (
                  <article
                    key={role.id}
                    className={`roles-list-item${isActive ? " is-active" : ""}`}
                    onClick={() => setSelectedRoleId(role.id)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isActive ? "#FBF8FE" : "transparent",
                      color: isActive ? "#795289" : "#4A5568",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: isActive ? "600" : "500" }}>{role.name}</span>
                  </article>
                );
              })}

              {roles.length === 0 && (
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
                  <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#171e2b", margin: 0 }}>{selectedRole.name}</h2>
                </div>

                <div className="roles-tabs" style={{ display: "flex", gap: "24px", borderBottom: "1px solid #E3E7ED", marginBottom: "24px" }}>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab("role-info")}
                    style={{ 
                      background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer", 
                      fontSize: "14px", fontWeight: "500", 
                      color: activeTab === "role-info" ? "#171e2b" : "#A0AEC0",
                      borderBottom: activeTab === "role-info" ? "2px solid #795289" : "2px solid transparent",
                      position: "relative", top: "1px"
                    }}
                  >
                    Role Info
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab("role-permissions")}
                    style={{ 
                      background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer", 
                      fontSize: "14px", fontWeight: "500", 
                      color: activeTab === "role-permissions" ? "#171e2b" : "#A0AEC0",
                      borderBottom: activeTab === "role-permissions" ? "2px solid #795289" : "2px solid transparent",
                      position: "relative", top: "1px"
                    }}
                  >
                    Role Permissions
                  </button>
                </div>

                {activeTab === "role-permissions" && (
                  <div className="roles-permission-groups" style={{ flex: 1, overflowY: "auto" }}>
                    {permissionSections.map((section) => (
                      <div key={section.id} className="roles-permission-group" style={{ marginBottom: "32px" }}>
                        <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#795289", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>{section.label}</h3>

                        <div className="roles-permission-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {section.items.map((item) => (
                            <div key={item.id} className="roles-permission-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #F1F4F9" }}>
                              <div className="roles-permission-copy">
                                <strong style={{ fontSize: "14px", fontWeight: "500", color: "#171e2b", display: "block" }}>{item.title}</strong>
                                {item.description && <p style={{ fontSize: "12px", color: "#A0AEC0", margin: "4px 0 0 0" }}>{item.description}</p>}
                              </div>

                              <button
                                type="button"
                                className={`roles-switch${selectedRole.permissions[item.id] ? " is-on" : ""}`}
                                aria-pressed={selectedRole.permissions[item.id]}
                                aria-label={`${selectedRole.permissions[item.id] ? "Disable" : "Enable"} ${item.title}`}
                                onClick={() => togglePermission(item.id)}
                              >
                                <span />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "role-info" && (
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div style={{ marginBottom: "32px" }}>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#171e2b", marginBottom: "8px" }}>Roles Name <span style={{color: "#E53E3E"}}>*</span></label>
                      <input 
                        type="text" 
                        value={selectedRole.name} 
                        onChange={handleRoleNameChange} 
                        placeholder="Enter role name" 
                        style={{ width: "100%", padding: "12px 16px", border: "1px solid #E3E7ED", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#171e2b" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "13px", color: "#A0AEC0" }}>{formatAssignedUsers(selectedRole.assignedUsers.length)}</span>
                      <button type="button" style={{ background: "#795289", color: "#FFF", border: "none", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "500", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span>+</span> Assign User
                      </button>
                    </div>

                    <div style={{ border: "1px solid #E3E7ED", borderRadius: "12px", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 100px", padding: "12px 16px", background: "#F9FAFC", borderBottom: "1px solid #E3E7ED", fontSize: "13px", fontWeight: "500", color: "#80899a" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>Name <SortIcon /></span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>Email <SortIcon /></span>
                        <span>Action</span>
                      </div>

                      {selectedRole.assignedUsers.map((user) => (
                        <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 100px", padding: "12px 16px", alignItems: "center", borderBottom: "1px solid #F1F4F9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F4F6F9", color: "#929bac", display: "grid", placeItems: "center" }}>
                                <UserIcon />
                              </div>
                            )}
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#171e2b" }}>{user.name}</span>
                          </div>
                          <span style={{ fontSize: "14px", color: "#171e2b" }}>{user.email}</span>
                          <button 
                            type="button" 
                            onClick={() => removeAssignedUser(user.id)}
                            style={{ 
                              background: "transparent", border: "1px solid #E3E7ED", color: "#A0AEC0", 
                              borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: "500", 
                              display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer",
                              justifyContent: "center"
                            }}
                          >
                            <RemoveIcon style={{ width: "12px", height: "12px" }} />
                            Remove
                          </button>
                        </div>
                      ))}

                      {selectedRole.assignedUsers.length === 0 && (
                        <div style={{ padding: "32px", textAlign: "center", color: "#A0AEC0", fontSize: "14px" }}>
                          No users assigned to this role.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{ position: "absolute", bottom: "32px", right: "32px" }}>
                  <button type="button" disabled style={{ background: "#F4F6F9", color: "#A0AEC0", border: "none", padding: "10px 20px", borderRadius: "999px", fontSize: "14px", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "8px", opacity: "0.8" }}>
                    <CheckIcon /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="chapter-empty-state roles-empty-detail">
                <p>Select a role to view permissions.</p>
              </div>
            )}
          </section>
        </div>

        {toast && (
          <div className="roles-toast" role="status" aria-live="polite" style={{ background: "#171e2b", color: "#FFF", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", border: "none" }}>
            <div style={{ color: "#2ECC71", marginTop: "2px", flexShrink: 0 }}>
              <CheckIcon />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong style={{ fontSize: "14px", fontWeight: "600", color: "#FFF", margin: 0, lineHeight: 1.2 }}>{toast.title}</strong>
                <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)} style={{ background: "transparent", border: "none", color: "#A0AEC0", cursor: "pointer", padding: 0 }}>
                  <CloseIcon style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#A0AEC0", lineHeight: 1.4 }}>{toast.message}</p>
            </div>
          </div>
        )}
      </section>

      {isAddRoleModalOpen && (
        <div className="roles-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(25, 31, 42, 0.28)' }} onClick={() => setIsAddRoleModalOpen(false)}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '0', width: '380px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#171e2b' }}>Add Role</h3>
              <button type="button" onClick={() => setIsAddRoleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 0 }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#171e2b', fontWeight: '500' }}>Roles Name <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="text"
                placeholder="Enter role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #E3E7ED', borderRadius: '8px', outline: 'none', fontSize: '14px', color: '#171e2b', marginBottom: '24px' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddRoleModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#F4F6F9', color: '#4A5568', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="button" onClick={saveNewRole} disabled={!newRoleName.trim()} style={{ flex: 1, padding: '12px', background: newRoleName.trim() ? '#795289' : '#F4F6F9', color: newRoleName.trim() ? '#FFF' : '#A0AEC0', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: '500', cursor: newRoleName.trim() ? 'pointer' : 'default' }}>
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RolesPermissionsPage;
