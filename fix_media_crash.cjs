const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/dashboard/MediaLibraryPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix selectedMedia.* JSONB fields rendering
content = content.replace(
  /\{selectedMedia\.short_quote \|\| selectedMedia\.shortQuote \|\| "-"\}/g,
  '{renderTranslated(selectedMedia.short_quote || selectedMedia.shortQuote, "en") || "-"}'
);
content = content.replace(
  /\{selectedMedia\.why_it_matters \|\| selectedMedia\.whyItMatters \|\| "-"\}/g,
  '{renderTranslated(selectedMedia.why_it_matters || selectedMedia.whyItMatters, "en") || "-"}'
);
content = content.replace(
  /\{selectedMedia\.corpus_connection \|\| selectedMedia\.corpusConnection \|\| "-"\}/g,
  '{renderTranslated(selectedMedia.corpus_connection || selectedMedia.corpusConnection, "en") || "-"}'
);
content = content.replace(
  /\{selectedMedia\.critical_note \|\| selectedMedia\.criticalNote \|\| "-"\}/g,
  '{renderTranslated(selectedMedia.critical_note || selectedMedia.criticalNote, "en") || "-"}'
);
content = content.replace(
  /\{selectedMedia\.integration_question \|\| selectedMedia\.integrationQuestion \|\| "-"\}/g,
  '{renderTranslated(selectedMedia.integration_question || selectedMedia.integrationQuestion, "en") || "-"}'
);

fs.writeFileSync(filePath, content);
console.log('MediaLibraryPage patched');
