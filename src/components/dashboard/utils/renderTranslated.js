export function renderTranslated(value, activeLangCode = 'en') {
  if (!value) return "";
  if (typeof value === 'string') {
    // Attempt to parse JSON string if it looks like one
    try {
      if (value.startsWith('{') && value.endsWith('}')) {
        const parsed = JSON.parse(value);
        return parsed[activeLangCode] || parsed['en'] || "";
      }
    } catch (e) {
      // Not JSON, return as is
      return value;
    }
    return value;
  }
  
  if (typeof value === 'object') {
    return value[activeLangCode] || value['en'] || "";
  }
  
  return String(value);
}
