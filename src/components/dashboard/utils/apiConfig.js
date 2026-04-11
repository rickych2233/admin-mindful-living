const LOCAL_API_BASE_URL = import.meta.env.VITE_LOCAL_API_BASE_URL || "http://localhost:3001";
const SERVER_API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL || "http://72.61.143.83";
const USERS_API_PATH = import.meta.env.VITE_USERS_API_PATH || "/api/users";
const IS_LOCAL_HOST =
  typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const API_BASE_URL = IS_LOCAL_HOST ? LOCAL_API_BASE_URL : SERVER_API_BASE_URL;
const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;
const USERS_API_URL = `${API_BASE_URL}${USERS_API_PATH}`;
const USERS_API_FALLBACKS = Array.from(
  new Set([
    USERS_API_URL,
    `${API_BASE_URL}/api/users`,
    `${API_BASE_URL}/users`,
    `${LOCAL_API_BASE_URL}/api/users`,
    `${LOCAL_API_BASE_URL}/users`,
    `${SERVER_API_BASE_URL}/api/users`,
    `${SERVER_API_BASE_URL}/users`,
    "http://72.61.143.83/api/users",
  ])
);

export {
  LOCAL_API_BASE_URL,
  SERVER_API_BASE_URL,
  USERS_API_PATH,
  IS_LOCAL_HOST,
  API_BASE_URL,
  API_URL,
  USERS_API_URL,
  USERS_API_FALLBACKS,
};
