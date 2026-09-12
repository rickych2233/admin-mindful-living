const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/dashboard/pages/ChapterManagementPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes('useTranslations')) {
  content = content.replace(
    'import { fetchSectionsByChapter, createSection, deleteSection, toggleSectionStatus, normalizeSection, reorderSections } from "../utils/sectionUtils";',
    'import { fetchSectionsByChapter, createSection, deleteSection, toggleSectionStatus, normalizeSection, reorderSections } from "../utils/sectionUtils";\nimport { useTranslations, LANG_CODES } from "../utils/translateUtils";\nimport { renderTranslated } from "../utils/renderTranslated";'
  );
}

// 2. Add hook initialization inside component
if (!content.includes('const { translations')) {
  content = content.replace(
    'const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");',
    'const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");\n  const { translations, setTranslations, getVal, setVal, handleTranslate, merge } = useTranslations();'
  );
}

// 3. Fix list renderings to use renderTranslated
content = content.replace(/\{chapter\.title\}/g, '{renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}');
content = content.replace(/chapter\.title\.toLowerCase\(\)/g, 'renderTranslated(chapter.title, "en").toLowerCase()');

// 4. Update handleChapterFieldChange
const oldHandleChapterFieldChange = `  const handleChapterFieldChange = (field) => (e) => {
    setChapterForm((f) => ({ ...f, [field]: e.target.value }));
  };`;
const newHandleChapterFieldChange = `  const handleChapterFieldChange = (field) => (e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setChapterForm((f) => ({ ...f, [field]: e.target.value }));
    } else {
      setVal(field, activeLanguageTab, e.target.value);
    }
  };`;
content = content.replace(oldHandleChapterFieldChange, newHandleChapterFieldChange);

fs.writeFileSync(filePath, content);
console.log('Done basic patch');
