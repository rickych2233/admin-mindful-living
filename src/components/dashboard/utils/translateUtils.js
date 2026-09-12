import { useState } from 'react';
import { API_BASE_URL } from './apiConfig';

export async function autoTranslate(text, source = 'en') {
  if (!text || !text.trim()) return {};
  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source, targets: ['fr', 'id', 'ru', 'es'] })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.translations || {};
  } catch (error) {
    console.error("Auto-translate failed:", error);
    return {};
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
  const [translations, setTranslations] = useState(initial);
  const [isTranslating, setIsTranslating] = useState({});

  const getVal = (baseValue, field, activeTab) => {
    if (activeTab === 'English 🇬🇧') return baseValue || "";
    const lang = LANG_CODES[activeTab];
    return translations[field]?.[lang] || "";
  };

  const handleTranslate = async (text, field) => {
    if (!text || !text.trim()) return;
    setIsTranslating(prev => ({ ...prev, [field]: true }));
    try {
      const res = await autoTranslate(text);
      setTranslations(t => ({
        ...t,
        [field]: { ...(t[field] || {}), ...res }
      }));
    } finally {
      setIsTranslating(prev => ({ ...prev, [field]: false }));
    }
  };

  const setVal = (field, activeTab, val) => {
    const lang = LANG_CODES[activeTab];
    setTranslations(t => ({
      ...t,
      [field]: { ...(t[field] || {}), [lang]: val }
    }));
  };

  const merge = (baseValue, field) => {
    return { en: baseValue || "", ...(translations[field] || {}) };
  };

  return { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating };
}
