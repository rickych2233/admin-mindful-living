import { useState, useRef } from 'react';
import { API_BASE_URL } from './apiConfig';

export async function autoTranslate(text, source = 'en') {
  if (!text || !text.trim()) return {};
  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source, targets: ['fr', 'id', 'ru', 'es'] })
    });
    const result = await response.json();
    if (!response.ok || Object.keys(result.errors || {}).length) {
      const error = new Error(result.message || `HTTP error ${response.status}`);
      error.translations = result.translations || {};
      throw error;
    }
    return result.translations || {};
  } catch (error) {
    console.error("Auto-translate failed:", error);
    throw error;
  }
}

export const LANG_CODES = {
  'English 🇬🇧': 'en',
  'France 🇫🇷': 'fr',
  'Indonesian 🇮🇩': 'id',
  'Russian 🇷🇺': 'ru',
  'Spanish 🇪🇸': 'es'
};

export function useTranslations(initial = {}) {
  const [translations, updateTranslations] = useState(initial);
  const requests = useRef({});
  const manualEdits = useRef({});
  const [translationErrors, setTranslationErrors] = useState({});
  const setTranslations = (value) => {
    requests.current = {};
    manualEdits.current = {};
    setTranslationErrors({});
    setIsTranslating({});
    updateTranslations(value);
  };
  const [isTranslating, setIsTranslating] = useState({});

  const getVal = (baseValue, field, activeTab) => {
    if (activeTab === 'English 🇬🇧') return baseValue || "";
    const lang = LANG_CODES[activeTab];
    return translations[field]?.[lang] || "";
  };

  const handleTranslate = async (text, field) => {
    if (!text || !text.trim()) return;
    const request = Symbol(field);
    requests.current[field] = request;
    setIsTranslating(prev => ({ ...prev, [field]: true }));
    setTranslationErrors(prev => ({ ...prev, [field]: '' }));
    const apply = (result) => {
      if (requests.current[field] !== request) return;
      updateTranslations(t => ({
        ...t,
        [field]: { ...(t[field] || {}), ...Object.fromEntries(
          Object.entries(result).filter(([lang]) => !manualEdits.current[`${field}:${lang}`])
        ) }
      }));
    };
    try {
      apply(await autoTranslate(text));
    } catch (error) {
      apply(error.translations || {});
      if (requests.current[field] === request) {
        setTranslationErrors(prev => ({ ...prev, [field]: 'Translation failed for one or more languages. Please retry.' }));
      }
    } finally {
      if (requests.current[field] === request) setIsTranslating(prev => ({ ...prev, [field]: false }));
    }
  };

  const setVal = (field, activeTab, val) => {
    const lang = LANG_CODES[activeTab];
    manualEdits.current[`${field}:${lang}`] = true;
    updateTranslations(t => ({
      ...t,
      [field]: { ...(t[field] || {}), [lang]: val }
    }));
  };

  const merge = (baseValue, field) => {
    return { en: baseValue || "", ...(translations[field] || {}) };
  };

  return { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating, translationErrors };
}
