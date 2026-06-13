const fs = require('fs');

const raw = fs.readFileSync('temp_wiki_wikitext.json', 'utf16le');
const jsonText = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
const data = JSON.parse(jsonText);
const wikitext = data.parse?.wikitext;
if (typeof wikitext !== 'string') {
  throw new Error('Missing parse.wikitext in temp_wiki_wikitext.json');
}

const teamNameToCode = {
  'argentina': 'ARG', 'australia': 'AUS', 'austria': 'AUT', 'belgium': 'BEL', 'brazil': 'BRA',
  'canada': 'CAN', 'cape verde': 'CPV', 'cabo verde': 'CPV', 'costa rica': 'CRC', 'croatia': 'CRO',
  'curacao': 'CUW', 'czech republic': 'CZE', 'denmark': 'DEN', 'ecuador': 'ECU', 'egypt': 'EGY',
  'england': 'ENG', 'france': 'FRA', 'germany': 'GER', 'ghana': 'GHA', 'iraq': 'IRQ', 'iran': 'IRN',
  'japan': 'JPN', 'jord an': 'JOR', 'jordan': 'JOR', 'kazakhstan': 'KAZ', 'korea republic': 'KOR',
  'saudi arabia': 'KSA', 'south korea': 'KOR', 'south africa': 'RSA', 'mexico': 'MEX', 'morocco': 'MAR',
  'netherlands': 'NED', 'new zealand': 'NZL', 'nigeria': 'NGA', 'panama': 'PAN', 'paraguay': 'PAR',
  'peru': 'PER', 'poland': 'POL', 'portugal': 'POR', 'qatar': 'QAT', 'scotland': 'SCO', 'senegal': 'SEN',
  'serbia': 'SRB', 'slovakia': 'SVK', 'south korea': 'KOR', 'switzerland': 'SUI', 'tunisia': 'TUN',
  'uruguay': 'URU', 'usa': 'USA', 'united states': 'USA', "cote d'ivoire": 'CIV', 'ivory coast': 'CIV',
  'dr congo': 'COD', 'democratic republic of the congo': 'COD', 'congo': 'COD', 'bosnia and herzegovina': 'BIH',
  'bosnia & herzegovina': 'BIH', 'curacao': 'CUW', 'saudi arabia': 'KSA', 'south africa': 'RSA',
  'panama': 'PAN', 'czechia': 'CZE', 'czech republic': 'CZE',
};

function normalizeTeamName(name) {
  return name.trim().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function resolveTeamCode(name) {
  const normalized = normalizeTeamName(name);
  if (teamNameToCode[normalized]) return teamNameToCode[normalized];
  const prefix = normalized.slice(0, 3).toUpperCase();
  if (/^[A-Z]{3}$/.test(prefix)) return prefix;
  return null;
}

function extractTeamBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let teamName = null;
  let collecting = false;
  let blockLines = [];

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
  return blocks;
}

function parseTemplateParams(template) {
  const content = template.replace(/^\{\{nat fs g player\|/, '').replace(/\}\}$/, '');
  const params = {};
  let key = '';
  let value = '';
  let state = 'key';
  let depth = 0;

  for (let i = 0; i < content.length; i++) {
    const two = content.slice(i, i + 2);
    if (two === '{{' || two === '[[') {
      depth += 1;
      if (state === 'value') value += two;
      else key += two;
      i += 1;
      continue;
    }
    if (two === '}}' || two === ']]') {
      depth = Math.max(0, depth - 1);
      if (state === 'value') value += two;
      else key += two;
      i += 1;
      continue;
    }
    if (depth === 0 && content[i] === '|' && state === 'value') {
      params[key.trim()] = value.trim();
      key = '';
      value = '';
      state = 'key';
      continue;
    }
    if (state === 'key' && content[i] === '=') {
      state = 'value';
      continue;
    }
    if (state === 'key') {
      key += content[i];
    } else {
      value += content[i];
    }
  }
  if (key) params[key.trim()] = value.trim();
  return params;
}

function parsePlayerTemplates(block) {
  const players = [];
  let idx = 0;

  function normalizePosition(pos) {
    if (!pos) return 'FWD';
    const value = pos.toUpperCase();
    if (value === 'GK' || value === 'GOALKEEPER') return 'GK';
    if (value === 'DF' || value === 'DEF' || value === 'CB' || value === 'LB' || value === 'RB' || value === 'WB') return 'DEF';
    if (value === 'MF' || value === 'MID' || value === 'CM' || value === 'LM' || value === 'RM' || value === 'CAM' || value === 'CDM') return 'MID';
    if (value === 'FW' || value === 'FWD' || value === 'ST' || value === 'CF' || value === 'LW' || value === 'RW') return 'FWD';
    return 'FWD';
  }

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
    const template = block.slice(start, end);
    const params = parseTemplateParams(template);
    const rawName = params.name || params.text || '';
    const name = rawName.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1').replace(/\s*\(footballer[^)]*\)/g, '').trim();
    const number = parseInt(params.no, 10) || null;
    const position = normalizePosition(params.pos);
    if (name && number) {
      players.push({ name, number, position });
    }
    idx = end;
  }
  return players.sort((a, b) => a.number - b.number);
}

function computeRating(teamCode, position, index) {
  const normalizedPosition = position === 'DF' ? 'DEF' : position === 'MF' ? 'MID' : position === 'FW' ? 'FWD' : position;
  const baseRatings = {
    GK: 70,
    DEF: 68,
    MID: 69,
    FWD: 71,
  };
  const offsets = [0, -2, -4, -6, -8, -10, -12, -14, -16, -18];
  const offset = offsets[index] ?? -20;
  const rating = baseRatings[normalizedPosition];
  if (rating == null) return 60;
  return Math.max(45, Math.min(95, rating + offset));
}

const teamBlocks = extractTeamBlocks(wikitext);
const squads = {};
for (const { teamName, block } of teamBlocks) {
  const code = resolveTeamCode(teamName);
  if (!code) {
    console.warn('Unable to resolve team code for', teamName);
    continue;
  }
  const parsedPlayers = parsePlayerTemplates(block).map((player, idx) => ({
    id: `${code}-${player.number}`,
    name: player.name,
    position: player.position,
    number: player.number,
    rating: computeRating(code, player.position, idx),
  }));
  if (!squads[code]) {
    squads[code] = [];
  }
  squads[code].push(...parsedPlayers);
}

for (const code of Object.keys(squads)) {
  squads[code].sort((a, b) => a.number - b.number);
}

const outputJson = JSON.stringify(squads, null, 2);
fs.writeFileSync('src/data/realSquads.json', outputJson, 'utf8');
const tsFile = `import type { Player } from '../types';\n\nexport const REAL_SQUADS: Record<string, Player[]> = ${outputJson};\n`;
fs.writeFileSync('src/data/realSquads.ts', tsFile, 'utf8');
console.log('Wrote', Object.keys(squads).length, 'team squads');
