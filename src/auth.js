import { API_BASE_URL } from "./components/dashboard/utils/apiConfig";

// Access token lives in module memory only — a successful XSS gets at most
// a 15-minute token, never the refresh cookie (httpOnly, path=/api/auth).
let accessToken = null;
let currentUser = null;

export function getAccessToken() {
  return accessToken;
}

export function getCurrentUser() {
  return currentUser;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, useCookies: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Login gagal");
  }
  const data = await res.json();
  accessToken = data.accessToken;
  currentUser = data.user;
  return data.user;
}

/** Silent session restore on page reload via the refresh cookie. */
export async function tryRestoreSession() {
  try {
    // nativeFetch, not the patched window.fetch: a 401 here would re-enter
    // authedFetch → tryRestoreSession forever (Maximum call stack size exceeded).
    const res = await nativeFetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.accessToken;
    currentUser = data.user;
    return true;
  } catch (_err) {
    return false;
  }
}

export async function logout() {
  try {
    await authedFetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
  } catch (_err) {
    // Local state is cleared regardless.
  }
  accessToken = null;
  currentUser = null;
}

/** Fetch with the Bearer token; retries once after a token refresh. */
export async function authedFetch(input, init = {}) {
  const doFetch = () =>
    nativeFetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRestoreSession();
    if (refreshed) res = await doFetch();
  }
  return res;
}

// Patch global fetch so the dozens of existing bare `fetch("/api/...")`
// call sites gain auth + refresh handling without touching each file.
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  if (url && url.startsWith("/api/")) {
    return authedFetch(`${API_BASE_URL}${url}`, init);
  }
  if (url && url.startsWith(`${API_BASE_URL}/api/`)) {
    return authedFetch(input, init);
  }
  return nativeFetch(input, init);
};
