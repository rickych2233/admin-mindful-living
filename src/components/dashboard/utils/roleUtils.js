import { useState, useEffect } from "react";
import { ROLES_API_FALLBACKS } from "./apiConfig";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Build id-scoped endpoints from the fallback list.
function withId(id) {
  const encodedId = encodeURIComponent(String(id));
  return ROLES_API_FALLBACKS.map((endpoint) => `${String(endpoint).replace(/\/+$/, "")}/${encodedId}`);
}

function withIdAndSuffix(id, suffix) {
  return withId(id).map((endpoint) => `${endpoint}${suffix}`);
}

export function normalizeRole(item) {
  const idRaw = item.id ?? item._id ?? item.roleId ?? item.role_id;
  const id = idRaw ?? `${item.name || "role"}-${Math.random().toString(36).slice(2, 8)}`;

  // permissions may arrive as ["view-dashboard", ...] OR {key:true,...}
  let permissionKeys = [];
  if (Array.isArray(item.permissions)) {
    permissionKeys = item.permissions.filter((p) => typeof p === "string");
  } else if (item.permissions && typeof item.permissions === "object") {
    permissionKeys = Object.keys(item.permissions).filter((k) => item.permissions[k]);
  }

  const assignedUsers = (item.assigned_users ?? item.assignedUsers ?? item.users ?? []).map((u) => ({
    id: u.id ?? u.user_id ?? u._id,
    apiId: u.id ?? u.user_id ?? u._id,
    name: u.name || "-",
    email: u.email || "",
    avatar: u.avatar || null,
  }));

  const isSystem = Boolean(item.is_system ?? item.isSystem ?? item.canDelete === false);

  return {
    id,
    apiId: idRaw ?? null,
    name: item.name || "-",
    description: item.description || "",
    isSystem,
    canDelete: !isSystem,
    permissionKeys,
    assignedUsers,
    createdAt: item.createdAt || item.created_at || null,
  };
}

export function useRolesCollection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = () => setFetchKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoles() {
      setIsLoading(true);
      setError("");

      let lastError = "";
      try {
        let payload = null;
        for (const endpoint of ROLES_API_FALLBACKS) {
          try {
            console.debug("[roles] fetching endpoint:", endpoint);
            const response = await fetch(endpoint, { signal: controller.signal });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            payload = await response.json();
            break;
          } catch (endpointError) {
            if (endpointError.name === "AbortError") {
              throw endpointError;
            }
            console.error("[roles] endpoint failed:", endpoint, endpointError);
            lastError = endpointError.message || "Unknown error";
          }
        }

        if (!payload) {
          throw new Error(lastError || "All endpoints failed");
        }

        const rawRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.roles)
          ? payload.roles
          : [];
        setRows(rawRows.map(normalizeRole));
      } catch (err) {
        if (err.name !== "AbortError") {
          setRows([]);
          setError(`Gagal ambil data roles dari API. Detail: ${err.message || "Unknown error"}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRoles();

    return () => {
      controller.abort();
    };
  }, [fetchKey]);

  return { rows, isLoading, error, refetch };
}

export async function createRole(roleData) {
  let lastError = "Gagal membuat role";
  for (const endpoint of ROLES_API_FALLBACKS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}

export async function updateRole(id, roleData) {
  let lastError = "Gagal mengupdate role";
  for (const endpoint of withId(id)) {
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}

export async function deleteRole(id) {
  let lastError = "Gagal menghapus role";
  for (const endpoint of withId(id)) {
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}

export async function updateRolePermissions(id, permissionKeys) {
  let lastError = "Gagal memperbarui permission role";
  for (const endpoint of withIdAndSuffix(id, "/permissions")) {
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKeys }),
      });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}

export async function assignUser(roleId, userId) {
  let lastError = "Gagal menambahkan user ke role";
  for (const endpoint of withIdAndSuffix(roleId, "/users")) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}

export async function removeUser(roleId, userId) {
  let lastError = "Gagal menghapus user dari role";
  for (const endpoint of withIdAndSuffix(roleId, `/users/${encodeURIComponent(String(userId))}`)) {
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await parseJsonSafely(response);
      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }
      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }
  throw new Error(lastError);
}
