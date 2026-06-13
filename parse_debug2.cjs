const fs = require('fs');
const raw = fs.readFileSync('temp_wiki_wikitext.json', 'utf16le');
const text = raw.charCodeAt(0) === 65279 ? raw.slice(1) : raw;
const lines = text.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('===Czech Republic===') || lines[i].includes('===')) {
    console.log(i, JSON.stringify(lines[i]));
    if (i > 40) break;
  }
}
const idx = text.indexOf('===Czech Republic===');
console.log('index', idx);
const snippet = text.slice(idx, idx + 2000);
console.log(snippet.slice(0, 500));
