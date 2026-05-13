/**
 * Theme Configuration Helper
 * Mempermudah penggantian theme dengan berbagai preset
 */

export const themes = {
  // Default theme (stone/warm gray - sesuai gambar)
  default: {
    primary: "#78716c",
    primaryHover: "#57534e",
    primaryLight: "#f5f5f4",
    name: "Stone (Default)",
  },

  // Modern Blue
  blue: {
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    primaryLight: "#dbeafe",
    name: "Modern Blue",
  },

  // Fresh Green
  green: {
    primary: "#10b981",
    primaryHover: "#059669",
    primaryLight: "#d1fae5",
    name: "Fresh Green",
  },

  // Elegant Purple
  purple: {
    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    primaryLight: "#ede9fe",
    name: "Elegant Purple",
  },

  // Warm Orange
  orange: {
    primary: "#f59e0b",
    primaryHover: "#d97706",
    primaryLight: "#fef3c7",
    name: "Warm Orange",
  },

  // Professional Navy
  navy: {
    primary: "#1e40af",
    primaryHover: "#1e3a8a",
    primaryLight: "#dbeafe",
    name: "Professional Navy",
  },

  // Soft Pink
  pink: {
    primary: "#ec4899",
    primaryHover: "#db2777",
    primaryLight: "#fce7f3",
    name: "Soft Pink",
  },

  // Teal
  teal: {
    primary: "#14b8a6",
    primaryHover: "#0d9488",
    primaryLight: "#ccfbf1",
    name: "Teal",
  },

  // Indigo
  indigo: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryLight: "#e0e7ff",
    name: "Indigo",
  },

  // Rose
  rose: {
    primary: "#f43f5e",
    primaryHover: "#e11d48",
    primaryLight: "#ffe4e6",
    name: "Rose",
  },

  // Stone/Warm (sesuai gambar yang dikirim)
  stone: {
    primary: "#78716c",
    primaryHover: "#57534e",
    primaryLight: "#f5f5f4",
    name: "Stone (Earth)",
  },

  // Teal/Emerald (accent color dari gambar)
  emerald: {
    primary: "#10b981",
    primaryHover: "#059669",
    primaryLight: "#d1fae5",
    name: "Emerald",
  },
};

/**
 * Apply theme ke document root
 * @param {string} themeName - Nama theme yang akan diterapkan
 */
export function applyTheme(themeName = "default") {
  const theme = themes[themeName] || themes.default;

  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-hover", theme.primaryHover);
  root.style.setProperty("--color-primary-light", theme.primaryLight);

  // Update CSS variables yang bergantung pada primary color
  root.style.setProperty("--button-bg-primary", theme.primary);
  root.style.setProperty("--sidebar-border", theme.primaryLight);

  console.log(`Theme "${theme.name || themeName}" applied`);
}

/**
 * Dapatkan semua available themes
 * @returns {Array} Array of theme objects
 */
export function getAvailableThemes() {
  return Object.entries(themes).map(([key, value]) => ({
    key,
    name: value.name || key.charAt(0).toUpperCase() + key.slice(1),
    ...value,
  }));
}

/**
 * Simpan theme preference ke localStorage
 * @param {string} themeName - Nama theme
 */
export function saveThemePreference(themeName) {
  try {
    localStorage.setItem("dashboard-theme", themeName);
  } catch (error) {
    console.error("Failed to save theme preference:", error);
  }
}

/**
 * Load theme preference dari localStorage
 * @returns {string} Nama theme atau 'default'
 */
export function loadThemePreference() {
  try {
    return localStorage.getItem("dashboard-theme") || "default";
  } catch (error) {
    console.error("Failed to load theme preference:", error);
    return "default";
  }
}

/**
 * Initialize theme on app load
 * @param {string} defaultTheme - Default theme jika tidak ada preference
 */
export function initializeTheme(defaultTheme = "default") {
  const savedTheme = loadThemePreference();
  applyTheme(savedTheme || defaultTheme);
}

export default themes;