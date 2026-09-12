const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, 'src/components/dashboard/pages/ChapterManagementPage.jsx'),
  path.join(__dirname, 'src/components/dashboard/MediaLibraryPage.jsx')
];

for (const filePath of filePaths) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix chapter.title
  content = content.replace(/\{chapter\.title\}/g, '{renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}');
  content = content.replace(/chapter\.title\.toLowerCase\(\)/g, '(renderTranslated(chapter.title, "en") || "").toLowerCase()');
  content = content.replace(/\`Move \$\{chapter\.title\}\`/g, '`Move ${renderTranslated(chapter.title, "en")}`');
  content = content.replace(/alt=\{chapter\.title\}/g, 'alt={renderTranslated(chapter.title, "en")}');
  content = content.replace(/\`Edit \$\{chapter\.title\}\`/g, '`Edit ${renderTranslated(chapter.title, "en")}`');
  content = content.replace(/\`Delete \$\{chapter\.title\}\`/g, '`Delete ${renderTranslated(chapter.title, "en")}`');
  content = content.replace(/Sections in \{chapter\.title\}/g, 'Sections in {renderTranslated(chapter.title, "en")}');
  content = content.replace(/title: chapter\.title \|\| "",/g, 'title: renderTranslated(chapter.title, "en") || "",');
  content = content.replace(/description: chapter\.description \|\| "",/g, 'description: renderTranslated(chapter.description, "en") || "",');

  // Fix sec.title
  content = content.replace(/\{sec\.title\}/g, '{renderTranslated(sec.title, LANG_CODES[activeLanguageTab])}');
  content = content.replace(/sectionName: firstSection\?\.title \|\| "",/g, 'sectionName: renderTranslated(firstSection?.title, "en") || "",');
  content = content.replace(/sectionName: section\.title \|\| "",/g, 'sectionName: renderTranslated(section.title, "en") || "",');

  // Fix content.title
  content = content.replace(/\{content\.title\}/g, '{renderTranslated(content.title, LANG_CODES[activeLanguageTab])}');

  // In MediaLibraryPage, chapters.title
  content = content.replace(/c\.title/g, 'renderTranslated(c.title, LANG_CODES[activeLanguageTab])');
  content = content.replace(/ch\.title/g, 'renderTranslated(ch.title, LANG_CODES[activeLanguageTab])');

  fs.writeFileSync(filePath, content);
}

console.log('Crash fixed');
