const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/dashboard/MediaLibraryPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('useTranslations')) {
  content = content.replace(
    'import { PlusIcon } from "./commonComponents";',
    'import { PlusIcon } from "./commonComponents";\nimport { useTranslations, LANG_CODES } from "./utils/translateUtils";\nimport { renderTranslated } from "./utils/renderTranslated";'
  );
}

// 2. Add hook initialization inside component
if (!content.includes('const { translations')) {
  content = content.replace(
    'const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");',
    'const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");\n  const { translations, setTranslations, getVal, setVal, handleTranslate, merge } = useTranslations();'
  );
}

// 3. Fix save payload
content = content.replace(
  'body: JSON.stringify({ ...mediaForm, thumbnail: typeof selectedThumbnail === \'string\' ? selectedThumbnail : (selectedThumbnail?.preview || null), contentFile: selectedMediaFile }),',
  'body: JSON.stringify({ ...mediaForm, shortQuote: merge(mediaForm.shortQuote, "shortQuote"), whyItMatters: merge(mediaForm.whyItMatters, "whyItMatters"), corpusConnection: merge(mediaForm.corpusConnection, "corpusConnection"), criticalNote: merge(mediaForm.criticalNote, "criticalNote"), integrationQuestion: merge(mediaForm.integrationQuestion, "integrationQuestion"), thumbnail: typeof selectedThumbnail === \'string\' ? selectedThumbnail : (selectedThumbnail?.preview || null), contentFile: selectedMediaFile }),'
);

// 4. Update the input fields
const fields = ['shortQuote', 'whyItMatters', 'corpusConnection', 'criticalNote', 'integrationQuestion'];
fields.forEach(field => {
  const regex = new RegExp(`value=\\{mediaForm\\.${field} \\|\\| ""\\} onChange=\\{\\(e\\) => setMediaForm\\(\\{\\.\\.\\.mediaForm, ${field}: e\\.target\\.value\\}\\)\\}`, 'g');
  const replacement = `value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.${field} || "") : getVal(mediaForm.${field}, '${field}', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, ${field}: e.target.value});
    } else {
      setVal('${field}', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.${field}, '${field}');
  }}`;
  content = content.replace(regex, replacement);
});

// Update table rows to use renderTranslated (name is not translatable, wait! What about table?)
// Only the fields we modified are JSONB. The name is still varchar.
// So table row for name is fine.

fs.writeFileSync(filePath, content);
console.log('Done patch media');
