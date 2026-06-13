const fs = require('fs');
const raw = fs.readFileSync('temp_wiki_wikitext.json', 'utf16le');
const text = raw.charCodeAt(0) === 65279 ? raw.slice(1) : raw;
const lines = text.split(/\r?\n/);
let teamName = null;
let collecting = false;
let blockLines = [];
const blocks = [];
for (const line of lines) {
  const headingMatch = line.match(/^===\s*(.+?)\s*===/);
  if (headingMatch) {
    teamName = headingMatch[1];
    collecting = false;
    blockLines = [];
    continue;
  }
  if (teamName && line.includes('{{nat fs g start}}')) {
    collecting = true;
    blockLines = [line];
    continue;
  }
  if (collecting) {
    blockLines.push(line);
    if (line.includes('{{nat fs end}}')) {
      blocks.push({ teamName, block: blockLines.join('\n') });
      collecting = false;
    }
  }
}
const cze = blocks.filter((b) => b.teamName === 'Czech Republic');
console.log('blocks', cze.length);
console.log(
cze.map((b, i) => ({
  i,
  len: b.block.split(/\r?\n/).length,
  players: (b.block.match(/\{\{nat fs g player/g) || []).length,
}))
);
console.log('first block ends with end?', cze[0]?.block.endsWith('{{nat fs end}}'));
console.log('second block ends with end?', cze[1]?.block.endsWith('{{nat fs end}}'));
