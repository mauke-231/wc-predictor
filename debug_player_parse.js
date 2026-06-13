const fs = require('fs');
const raw = fs.readFileSync('temp_wiki_wikitext.json', 'utf16le');
const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
const data = JSON.parse(text);
const wikitext = data.parse.wikitext;
const start = wikitext.indexOf('===Czech Republic===');
const snippet = wikitext.slice(start, start + 7000);
const blockStart = snippet.indexOf('{{nat fs g start}}');
const blockEnd = snippet.indexOf('{{nat fs end}}', blockStart);
const block = snippet.slice(blockStart, blockEnd + '{{nat fs end}}'.length);
let idx = 0;
const players = [];
while (idx < block.length) {
  const start = block.indexOf('{{nat fs g player', idx);
  if (start === -1) break;
  let braces = 0;
  let end = start;
  while (end < block.length) {
    const two = block.slice(end, end + 2);
    if (two === '{{') {
      braces += 2;
      end += 2;
      continue;
    }
    if (two === '}}') {
      braces -= 2;
      end += 2;
      if (braces === 0) break;
      continue;
    }
    end += 1;
  }
  const template = block.slice(start, end + 2);
  players.push(template);
  idx = end + 2;
}
console.log('templates', players.length);
for (let i = 0; i < players.length; i++) {
  console.log(i, players[i].slice(0, 80).replace(/\n/g, ' '));
}
