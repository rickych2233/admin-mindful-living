import { useState, useRef } from 'react';
import { API_BASE_URL, USE_LOCAL_API } from './apiConfig';

const stripHtmlText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

export async function autoTranslate(text, source = 'en') {
  if (!text || !stripHtmlText(text)) return {};
  const endpoints = Array.from(
    new Set(
      USE_LOCAL_API
        ? [`${API_BASE_URL}/api/translate`, '/api/translate']
        : ['/api/translate', `${API_BASE_URL}/api/translate`]
    )
  );

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
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
      lastError = error;
      if (error.translations && Object.keys(error.translations).length > 0) {
        break;
      }
    }
  }
  console.error("Auto-translate failed:", lastError);
  throw lastError;
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
    if (!text || !stripHtmlText(text)) return;
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
    return { ...(translations[field] || {}), en: baseValue || "" };
  };

  return { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating, translationErrors };
}
