/**
 * Theme Switcher Component
 * Memungkinkan user mengganti theme warna secara realtime
 */
import React, { useState, useEffect } from "react";
import { applyTheme, getAvailableThemes, saveThemePreference } from "../../styles/themes";
import "./ThemeSwitcher.css";

function ThemeSwitcher({ currentTheme = "default", onThemeChange = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const availableThemes = getAvailableThemes();

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
    applyTheme(themeKey);
    saveThemePreference(themeKey);

    if (onThemeChange) {
      onThemeChange(themeKey);
    }

    setIsOpen(false);
  };

  const currentThemeData = availableThemes.find((t) => t.key === selectedTheme) || availableThemes[0];

  return (
    <div className="theme-switcher">
      <button
        type="button"
        className="theme-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title={`Current theme: ${currentThemeData.name}`}
      >
        <span
          className="theme-preview"
          style={{ backgroundColor: currentThemeData.primary }}
          aria-hidden="true"
        />
        <span className="theme-name">{currentThemeData.name}</span>
        <svg
          className={`theme-chevron${isOpen ? " is-open" : ""}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-list">
            {availableThemes.map((theme) => (
              <button
                key={theme.key}
                type="button"
                className={`theme-option${selectedTheme === theme.key ? " is-selected" : ""}`}
                onClick={() => handleThemeChange(theme.key)}
                title={theme.name}
              >
                <span
                  className="theme-color-preview"
                  style={{ backgroundColor: theme.primary }}
                  aria-hidden="true"
                />
                <span className="theme-option-name">{theme.name}</span>
                {selectedTheme === theme.key && (
                  <svg className="theme-check" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 12.5 2.5 2.5 5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;