import { useState, useEffect } from "react";
import { API_URL, USERS_API_FALLBACKS } from "./apiConfig";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveUserStatus(item) {
  const rawStatus =
    item.status ??
    item.accountStatus ??
    item.account_status ??
    item.active ??
    item.isActive ??
    item.is_active ??
    item.user?.active ??
    item.user?.is_active ??
    item.user?.status;

  if (rawStatus === true || rawStatus === 1 || rawStatus === "1") {
    return "Active";
  }
  if (rawStatus === false || rawStatus === 0 || rawStatus === "0") {
    return "Inactive";
  }

  const normalized = String(rawStatus ?? "").trim().toLowerCase();
  if (
    normalized === "inactive" ||
    normalized === "in-active" ||
    normalized === "nonactive" ||
    normalized === "disabled" ||
    normalized === "false" ||
    normalized === "tidak aktif" ||
    normalized === "nonaktif"
  ) {
    return "Inactive";
  }
  if (
    normalized === "active" ||
    normalized === "aktif" ||
    normalized === "enabled" ||
    normalized === "true"
  ) {
    return "Active";
  }

  return "Active";
}

// Fungsi untuk update user
export async function updateUser(id, userData) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengupdate user");
    }

    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function toggleUserActive(id) {
  const encodedId = encodeURIComponent(String(id));
  const usersBases = USERS_API_FALLBACKS.filter((endpoint) => /\/users\/?$/i.test(String(endpoint)));
  const endpoints = Array.from(
    new Set([
      `${API_URL}/users/${encodedId}/toggle-active`,
      ...usersBases.map((usersEndpoint) => `${String(usersEndpoint).replace(/\/+$/, "")}/${encodedId}/toggle-active`),
    ])
  );

  let lastError = "Gagal mengubah status user";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }

      return data;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  try {
    throw new Error(lastError);
  } catch (error) {
    console.error("Error toggling user active:", error);
    throw error;
  }
}

export async function updateUserStatusViaApi(userId) {
  if (userId === null || userId === undefined || String(userId).trim() === "") {
    throw new Error("User ID tidak tersedia untuk update status.");
  }

  return toggleUserActive(userId);
}

export function normalizeUser(item) {
  const idRaw = item.id ?? item._id ?? item.userId ?? item.user_id ?? item.uuid ?? item.user?.id ?? item.user?._id;
  const id = idRaw ?? `${item.email || item.name || "user"}-${Math.random().toString(36).slice(2, 8)}`;
  const languageDetail = String(item.languageDetail || item.language_detail || item.language || "English");
  const languageCode = languageDetail.slice(0, 2).toUpperCase() || "EN";
  const biometricRaw = item.biometric ?? item.biometricEnabled ?? item.biometric_enabled;
  const biometric = biometricRaw === true || biometricRaw === "On" ? "On" : "Off";

  const donationRaw = item.donation ?? item.donationAmount ?? item.donation_amount ?? item.amount;
  const donation =
    donationRaw === null || donationRaw === undefined || donationRaw === ""
      ? "-"
      : typeof donationRaw === "number"
      ? `$${donationRaw.toFixed(2)}`
      : String(donationRaw);

  const status = resolveUserStatus(item);
  const registeredRaw = item.registered ?? item.createdAt ?? item.created_at;
  const registeredDate = registeredRaw ? new Date(registeredRaw) : null;
  const registered =
    registeredDate && !Number.isNaN(registeredDate.getTime())
      ? registeredDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "-";

  const lastLoginRaw = item.lastLogin || item.last_login || item.lastActive || item.last_active || item.updated_at || item.created_at;
  const lastLoginDate = lastLoginRaw ? new Date(lastLoginRaw) : null;
  const lastActiveDetail =
    lastLoginDate && !Number.isNaN(lastLoginDate.getTime())
      ? lastLoginDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : String(lastLoginRaw || "-");

  const chaptersCompletedRaw =
    item.chaptersCompleted ?? item.chapters_completed ?? item.completedChapters ?? item.completed_chapters;
  const chaptersCompleted = chaptersCompletedRaw ? String(chaptersCompletedRaw) : "-";

  return {
    id,
    apiId: idRaw ?? null,
    name: item.name || item.fullName || "-",
    email: item.email || "-",
    language: languageCode,
    languageDetail,
    biometric,
    donationAmount: donation,
    lastActive: lastActiveDetail,
    lastActiveDetail,
    status,
    registered,
    chaptersCompleted,
  };
}

export function useUsersCollection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      let lastError = "";
      try {
        let payload = null;
        for (const endpoint of USERS_API_FALLBACKS) {
          try {
            console.debug("[users] fetching endpoint:", endpoint);
            const response = await fetch(endpoint, { signal: controller.signal });
            console.debug("[users] response status:", response.status, "ok:", response.ok, "url:", response.url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            payload = await response.json();
            break;
          } catch (endpointError) {
            if (endpointError.name === "AbortError") {
              throw endpointError;
            }
            console.error("[users] endpoint failed:", endpoint, endpointError);
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
          : Array.isArray(payload?.users)
          ? payload.users
          : [];
        const normalizedRows = rawRows.map(normalizeUser);
        setRows(normalizedRows);
      } catch (err) {
        if (err.name !== "AbortError") {
          setRows([]);
          setError(`Gagal ambil data users dari API. Detail: ${err.message || "Unknown error"}`);
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
