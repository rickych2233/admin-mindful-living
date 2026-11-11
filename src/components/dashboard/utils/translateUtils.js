import { useState, useRef } from 'react';
import { API_BASE_URL, USE_LOCAL_API } from './apiConfig';

export const stripHtmlText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

export const sanitizeEditorHtml = (html) => {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/\sstyle=(["'])(.*?)\1/gi, (match, quote, styleContent) => {
    const cleaned = styleContent
      .split(';')
      .map((rule) => rule.trim())
      .filter((rule) => {
        if (!rule) return false;
        const prop = rule.split(':')[0]?.trim().toLowerCase();
        return !['color', 'background', 'background-color', 'caret-color'].includes(prop);
      })
      .join('; ');
    return cleaned ? ` style=${quote}${cleaned}${quote}` : '';
  });
};

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

const TARGET_LANGS = ['fr', 'id', 'ru', 'es'];

export function useTranslations(initial = {}) {
  const [translations, updateTranslations] = useState(initial);
  const translationsRef = useRef(initial);
  const requests = useRef({});
  const manualEdits = useRef({});
  const lastTranslatedSource = useRef({});
  const inFlightSource = useRef({});
  const [translationErrors, setTranslationErrors] = useState({});
  const [isTranslating, setIsTranslating] = useState({});

  const setTranslations = (value) => {
    requests.current = {};
    manualEdits.current = {};
    lastTranslatedSource.current = {};
    inFlightSource.current = {};
    setTranslationErrors({});
    setIsTranslating({});
    const nextVal = typeof value === 'function' ? value(translationsRef.current) : value;
    translationsRef.current = nextVal || {};
    updateTranslations(translationsRef.current);
  };

  const getVal = (baseValue, field, activeTab) => {
    if (activeTab === 'English 🇬🇧') return baseValue || "";
    const lang = LANG_CODES[activeTab];
    return translations[field]?.[lang] || "";
  };

  const handleTranslate = async (text, field) => {
    const cleanText = sanitizeEditorHtml(String(text || '')).trim();
    if (!cleanText || !stripHtmlText(cleanText)) return;

    const existingFieldTrans = translationsRef.current[field] || {};
    const hasAllTargets = TARGET_LANGS.every(
      (lang) => Boolean(existingFieldTrans[lang] && stripHtmlText(existingFieldTrans[lang]))
    );

    if (inFlightSource.current[field] === cleanText) {
      return;
    }
    if (lastTranslatedSource.current[field] === cleanText && hasAllTargets && !translationErrors[field]) {
      return;
    }

    if (lastTranslatedSource.current[field] && lastTranslatedSource.current[field] !== cleanText) {
      TARGET_LANGS.forEach((lang) => {
        delete manualEdits.current[`${field}:${lang}`];
      });
    }

    const request = Symbol(field);
    requests.current[field] = request;
    inFlightSource.current[field] = cleanText;
    setIsTranslating(prev => ({ ...prev, [field]: true }));
    setTranslationErrors(prev => ({ ...prev, [field]: '' }));
    const apply = (result) => {
      if (requests.current[field] !== request) return;
      updateTranslations(t => {
        const next = {
          ...t,
          [field]: {
            ...(t[field] || {}),
            ...Object.fromEntries(
              Object.entries(result).filter(([lang]) => !manualEdits.current[`${field}:${lang}`])
            )
          }
        };
        translationsRef.current = next;
        return next;
      });
    };
    try {
      const translated = await autoTranslate(cleanText);
      apply(translated);
      if (requests.current[field] === request) {
        lastTranslatedSource.current[field] = cleanText;
      }
    } catch (error) {
      apply(error.translations || {});
      if (requests.current[field] === request) {
        setTranslationErrors(prev => ({ ...prev, [field]: 'Translation failed for one or more languages. Please retry.' }));
      }
    } finally {
      if (requests.current[field] === request) {
        delete inFlightSource.current[field];
        setIsTranslating(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  const setVal = (field, activeTab, val) => {
    const lang = LANG_CODES[activeTab];
    if (!lang || lang === 'en') return;
    const prevVal = translationsRef.current[field]?.[lang] || "";
    if (stripHtmlText(val) === "" && stripHtmlText(prevVal) === "") {
      return;
    }
    if (val === prevVal) {
      return;
    }
    manualEdits.current[`${field}:${lang}`] = true;
    updateTranslations(t => {
      const next = {
        ...t,
        [field]: { ...(t[field] || {}), [lang]: val }
      };
      translationsRef.current = next;
      return next;
    });
  };

  const merge = (baseValue, field) => {
    return { ...(translationsRef.current[field] || translations[field] || {}), en: baseValue || "" };
  };

  return { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating, translationErrors };
}
