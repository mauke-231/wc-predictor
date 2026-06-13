const fs = require('fs');
const data = JSON.parse(fs.readFileSync('temp_wiki_wikitext.json', 'utf8'));
console.log(Object.keys(data));
console.log('has text:', typeof data.text === 'string');
console.log('text length:', data.text.length);
