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
    label: "CHAPTER MANAGER",
    items: [
      { id: "view-chapter", title: "View Chapter" },
      { id: "edit-chapters", title: "Create / Edit Chapters & Sections" },
      { id: "delete-chapters", title: "Delete Chapters & Sections" },
      { id: "publish-chapters", title: "Publish / Unpublish" },
    ],
  },
  {
    id: "user",
    label: "USER MANAGEMENT",
    items: [
      { id: "view-users", title: "View Users" },
      {
        id: "mark-user-inactive",
        title: "Mark User as Inactive",
        description: "Soft-disable user access without deleting data",
      },
    ],
  },
  {
    id: "practice",
    label: "PRACTICE MANAGEMENT",
    items: [
      { id: "manage-categories", title: "Manage Categories" },
      { id: "manage-practices", title: "Manage Practices & Sessions" },
    ],
  },
  {
    id: "community",
    label: "COMMUNITY",
    items: [
      { id: "view-discussion", title: "View Discussion" },
      { id: "moderate-reports", title: "Moderate Reports" },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    items: [
      { id: "manage-resources", title: "Manage Resources" },
      { id: "approve-suggestions", title: "Approve User Suggestions" },
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
      { id: "adam-coles", name: "Adam Coles", email: "adam.coles@email.com" },
      { id: "ashley-williams", name: "Ashley Williams", email: "ashley.williams@email.com" },
    ],
    permissions: createPermissions(allPermissionIds),
    canDelete: false,
  },
  {
    id: "content-editor",
    name: "Content Editor",
    assignedUsers: [
      { id: "marie-laura", name: "Marie Laura", email: "marie.laura@email.com" },
      { id: "marcus-chen", name: "Marcus Chen", email: "marcus.chen@email.com" },
      { id: "elena-rodriguez", name: "Elena Rodriguez", email: "elena.rodriguez@email.com" },
      { id: "david-kim", name: "David Kim", email: "david.kim@email.com" },
      { id: "david-miller", name: "David Miller", email: "david.miller@email.com" },
    ],
    permissions: createPermissions([
      "view-dashboard",
      "view-chapter",
      "edit-chapters",
      "publish-chapters",
      "manage-categories",
      "manage-practices",
      "view-discussion",
      "manage-resources",
      "approve-suggestions",
    ]),
    canDelete: true,
  },
  {
    id: "moderator",
    name: "Moderator",
    assignedUsers: [
      { id: "finn-wolfhard", name: "Finn Wolfhard", email: "finnwolfhard@email.com" },
      { id: "gigi-hadid", name: "Gigi Hadid", email: "gigi_hadid@email.com" },
      { id: "halsey-frangipane", name: "Halsey Frangipane", email: "halsey.frangipane@email.com" },
    ],
    permissions: createPermissions([
      "view-dashboard",
      "view-chapter",
      "view-users",
      "mark-user-inactive",
      "view-discussion",
      "moderate-reports",
      "manage-resources",
      "approve-suggestions",
    ]),
    canDelete: true,
  },
  {
    id: "viewer",
    name: "Viewer",
    assignedUsers: [
      { id: "camila-cabello", name: "Camila Cabello", email: "camilacc@email.com" },
      { id: "drake-graham", name: "Drake Graham", email: "drake_graham@email.com" },
      { id: "elijah-wood", name: "Elijah Wood", email: "elijah.wood@email.com" },
      { id: "bella-thorne", name: "Bella Thorne", email: "thornebella@email.com" },
      { id: "sofia-bauer", name: "Sofia Bauer", email: "sofia.bauer@email.com" },
      { id: "andi-kurniawan", name: "Andi Kurniawan", email: "andi.kurniawan@email.com" },
      { id: "marcus-lee", name: "Marcus Lee", email: "marcus.lee@email.com" },
      { id: "nina-ramos", name: "Nina Ramos", email: "nina.ramos@email.com" },
    ],
    permissions: createPermissions(["view-dashboard", "view-chapter", "view-users", "view-discussion"]),
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
  return `${amount} user assigned`;
}

function RolesPermissionsPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoles[0]?.id ?? null);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: "", assignedUsers: [] });
  const [deleteRoleId, setDeleteRoleId] = useState(null);
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
    if (!selectedRole) {
      return;
    }

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
    const nextValue = event.target.value;
    setRoleForm((current) => ({
      ...current,
      name: nextValue,
    }));
  };

  const removeAssignedUser = (userId) => {
    setRoleForm((current) => ({
      ...current,
      assignedUsers: current.assignedUsers.filter((user) => user.id !== userId),
    }));
  };

  const saveRole = () => {
    const normalizedName = roleForm.name.trim();
    if (normalizedName === "") {
      return;
    }

    if (isEditMode) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRoleId
            ? {
                ...role,
                name: normalizedName,
                assignedUsers: roleForm.assignedUsers.map((user) => ({ ...user })),
              }
            : role
        )
      );
      if (selectedRoleId === editingRoleId) {
        setSelectedRoleId(editingRoleId);
      }
      closeEditModal();
      showToast("Change Saved", "You have successfully saved a changes");
      return;
    }

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
    closeEditModal();
    showToast("Role Added", "A new role has been added successfully");
  };

  const confirmDeleteRole = () => {
    if (!deleteRole) {
      return;
    }

    setRoles((current) => current.filter((role) => role.id !== deleteRole.id));
    setDeleteRoleId(null);
    if (selectedRoleId === deleteRole.id) {
      const nextRole = roles.find((role) => role.id !== deleteRole.id);
      setSelectedRoleId(nextRole?.id ?? null);
    }
    showToast("Role Deleted", "You have successfully deleted a role");
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

              <button type="button" className="chapter-add-btn roles-add-role-btn" onClick={openAddRoleModal}>
                <span>+</span>
                Add Role
              </button>
            </div>

            <div className="roles-list-body">
              {roles.map((role) => {
                const isActive = role.id === selectedRoleId;

                return (
                  <article
                    key={role.id}
                    className={`roles-list-item${isActive ? " is-active" : ""}`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="roles-list-copy">
                      <h3>{role.name}</h3>
                      <p>{formatAssignedUsers(role.assignedUsers.length)}</p>
                    </div>

                    <div className="roles-list-actions">
                      <button
                        type="button"
                        className="chapter-icon-btn"
                        aria-label={`Edit ${role.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditRoleModal(role);
                        }}
                      >
                        <EditIcon />
                      </button>
                      {role.canDelete && (
                        <button
                          type="button"
                          className="chapter-icon-btn"
                          aria-label={`Delete ${role.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteRoleId(role.id);
                          }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
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

          <section className="roles-detail-card">
            {selectedRole ? (
              <>
                <div className="roles-detail-header">
                  <h2>{selectedRole.name}</h2>
                </div>

                <div className="roles-permission-groups">
                  {permissionSections.map((section) => (
                    <div key={section.id} className="roles-permission-group">
                      <h3>{section.label}</h3>

                      <div className="roles-permission-list">
                        {section.items.map((item) => (
                          <div key={item.id} className="roles-permission-row">
                            <div className="roles-permission-copy">
                              <strong>{item.title}</strong>
                              {item.description && <p>{item.description}</p>}
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
              </>
            ) : (
              <div className="chapter-empty-state roles-empty-detail">
                <p>Select a role to view permissions.</p>
              </div>
            )}
          </section>
        </div>

        {toast && (
          <div className="roles-toast" role="status" aria-live="polite">
            <div className="roles-toast-header">
              <div className="roles-toast-copy">
                <div className="roles-toast-icon" aria-hidden="true">
                  <CheckIcon />
                </div>
                <div>
                  <strong>{toast.title}</strong>
                  <p>{toast.message}</p>
                </div>
              </div>

              <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>
                <CloseIcon />
              </button>
            </div>

            <button type="button" className="roles-toast-dismiss" onClick={() => setToast(null)}>
              Dismiss
            </button>
          </div>
        )}
      </section>

      {editingRoleId && (
        <div className="roles-modal-overlay" onClick={closeEditModal}>
          <aside className="roles-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="roles-modal-header">
              <h2>{isEditMode ? "Edit Roles" : "Add Role"}</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close roles modal" onClick={closeEditModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="roles-modal-body">
              <div className="roles-field">
                <span>Roles Name *</span>
                <input type="text" value={roleForm.name} onChange={handleRoleNameChange} placeholder="Enter role name" />
              </div>

              <div className="roles-assigned-block">
                <span>USER ASSIGNED LIST</span>

                <div className="roles-assigned-table">
                  <div className="roles-assigned-head">
                    <span className="sortable-head">
                      Name
                      <SortIcon />
                    </span>
                    <span className="sortable-head">
                      Email
                      <SortIcon />
                    </span>
                    <span>Action</span>
                  </div>

                  {roleForm.assignedUsers.map((user) => (
                    <div key={user.id} className="roles-assigned-row">
                      <div className="roles-assigned-user">
                        <div className="roles-user-avatar" aria-hidden="true">
                          <UserIcon />
                        </div>
                        <span>{user.name}</span>
                      </div>
                      <span className="roles-assigned-email">{user.email}</span>
                      <button type="button" className="roles-remove-user-btn" onClick={() => removeAssignedUser(user.id)}>
                        <RemoveIcon />
                        Remove
                      </button>
                    </div>
                  ))}

                  {roleForm.assignedUsers.length === 0 && (
                    <div className="roles-assigned-empty">
                      <p>No users assigned to this role.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="roles-modal-footer">
              <button type="button" className="chapter-secondary-btn" onClick={closeEditModal}>
                Cancel
              </button>
              <button type="button" className="chapter-primary-btn" onClick={saveRole} disabled={roleForm.name.trim() === ""}>
                <CheckIcon />
                Save Changes
              </button>
            </div>
          </aside>
        </div>
      )}

      {deleteRole && (
        <div className="roles-confirm-overlay" onClick={() => setDeleteRoleId(null)}>
          <div className="roles-confirm-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="roles-confirm-icon" aria-hidden="true">
              <AlertIcon />
            </div>
            <h2>Are you sure you want to delete this role?</h2>
            <p>This action is permanent and cannot be undone. Do you want to proceed?</p>

            <div className="roles-confirm-actions">
              <button type="button" className="chapter-secondary-btn" onClick={() => setDeleteRoleId(null)}>
                No, Keep It
              </button>
              <button type="button" className="chapter-primary-btn roles-delete-btn" onClick={confirmDeleteRole}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RolesPermissionsPage;
