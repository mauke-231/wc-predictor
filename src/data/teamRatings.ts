// Approximate FIFA rankings / strength ratings for WC 2026 qualified teams (June 2025 baseline)
const RATINGS: Record<string, { rank: number; overall: number; attack: number; defense: number; midfield: number }> = {
  ARG: { rank: 1, overall: 88, attack: 89, defense: 86, midfield: 88 },
  FRA: { rank: 2, overall: 87, attack: 88, defense: 85, midfield: 87 },
  BRA: { rank: 3, overall: 86, attack: 87, defense: 84, midfield: 86 },
  ENG: { rank: 4, overall: 85, attack: 86, defense: 83, midfield: 85 },
  BEL: { rank: 5, overall: 84, attack: 84, defense: 82, midfield: 85 },
  POR: { rank: 6, overall: 84, attack: 85, defense: 81, midfield: 84 },
  ESP: { rank: 7, overall: 83, attack: 84, defense: 82, midfield: 83 },
  NED: { rank: 8, overall: 83, attack: 83, defense: 81, midfield: 84 },
  ITA: { rank: 9, overall: 82, attack: 81, defense: 83, midfield: 82 },
  CRO: { rank: 10, overall: 82, attack: 80, defense: 83, midfield: 82 },
  URU: { rank: 11, overall: 81, attack: 80, defense: 82, midfield: 80 },
  MAR: { rank: 12, overall: 81, attack: 81, defense: 82, midfield: 79 },
  COL: { rank: 13, overall: 80, attack: 81, defense: 78, midfield: 80 },
  GER: { rank: 14, overall: 80, attack: 81, defense: 78, midfield: 80 },
  MEX: { rank: 15, overall: 79, attack: 78, defense: 77, midfield: 80 },
  USA: { rank: 16, overall: 78, attack: 77, defense: 76, midfield: 79 },
  SUI: { rank: 17, overall: 78, attack: 76, defense: 79, midfield: 78 },
  JPN: { rank: 18, overall: 77, attack: 78, defense: 75, midfield: 77 },
  SEN: { rank: 19, overall: 77, attack: 77, defense: 76, midfield: 76 },
  IRN: { rank: 20, overall: 76, attack: 75, defense: 77, midfield: 75 },
  DEN: { rank: 21, overall: 76, attack: 75, defense: 76, midfield: 76 },
  KOR: { rank: 22, overall: 75, attack: 76, defense: 74, midfield: 75 },
  AUT: { rank: 23, overall: 75, attack: 74, defense: 75, midfield: 75 },
  TUR: { rank: 24, overall: 74, attack: 74, defense: 73, midfield: 74 },
  ECU: { rank: 25, overall: 74, attack: 73, defense: 74, midfield: 74 },
  UKR: { rank: 26, overall: 73, attack: 72, defense: 73, midfield: 73 },
  SWE: { rank: 27, overall: 73, attack: 72, defense: 74, midfield: 72 },
  POL: { rank: 28, overall: 72, attack: 71, defense: 73, midfield: 72 },
  SRB: { rank: 29, overall: 72, attack: 72, defense: 71, midfield: 72 },
  CAN: { rank: 30, overall: 72, attack: 71, defense: 72, midfield: 72 },
  AUS: { rank: 31, overall: 71, attack: 70, defense: 72, midfield: 70 },
  NOR: { rank: 32, overall: 71, attack: 71, defense: 70, midfield: 71 },
  EGY: { rank: 33, overall: 70, attack: 70, defense: 70, midfield: 69 },
  CZE: { rank: 34, overall: 70, attack: 69, defense: 71, midfield: 70 },
  PAR: { rank: 35, overall: 69, attack: 69, defense: 68, midfield: 69 },
  WAL: { rank: 36, overall: 69, attack: 68, defense: 69, midfield: 69 },
  SCO: { rank: 37, overall: 68, attack: 67, defense: 69, midfield: 68 },
  TUN: { rank: 38, overall: 68, attack: 67, defense: 68, midfield: 67 },
  CRC: { rank: 39, overall: 67, attack: 66, defense: 68, midfield: 67 },
  ALG: { rank: 40, overall: 67, attack: 68, defense: 66, midfield: 66 },
  CHI: { rank: 41, overall: 66, attack: 65, defense: 67, midfield: 66 },
  RUS: { rank: 42, overall: 66, attack: 66, defense: 65, midfield: 66 },
  NGA: { rank: 43, overall: 66, attack: 67, defense: 64, midfield: 65 },
  PER: { rank: 44, overall: 65, attack: 64, defense: 65, midfield: 65 },
  PAN: { rank: 45, overall: 64, attack: 63, defense: 64, midfield: 64 },
  JOR: { rank: 46, overall: 63, attack: 62, defense: 64, midfield: 62 },
  GHA: { rank: 47, overall: 63, attack: 64, defense: 61, midfield: 62 },
  CIV: { rank: 48, overall: 63, attack: 63, defense: 62, midfield: 62 },
  QAT: { rank: 49, overall: 62, attack: 61, defense: 63, midfield: 61 },
  UZB: { rank: 50, overall: 62, attack: 62, defense: 61, midfield: 62 },
  BIH: { rank: 51, overall: 61, attack: 60, defense: 62, midfield: 61 },
  RSA: { rank: 52, overall: 60, attack: 59, defense: 61, midfield: 59 },
  KSA: { rank: 53, overall: 60, attack: 59, defense: 61, midfield: 59 },
  IRQ: { rank: 54, overall: 59, attack: 58, defense: 60, midfield: 58 },
  NZL: { rank: 55, overall: 58, attack: 57, defense: 59, midfield: 57 },
  CPV: { rank: 56, overall: 57, attack: 56, defense: 58, midfield: 56 },
  HAI: { rank: 57, overall: 55, attack: 54, defense: 56, midfield: 54 },
  CUW: { rank: 58, overall: 54, attack: 53, defense: 55, midfield: 53 },
  COD: { rank: 59, overall: 58, attack: 58, defense: 57, midfield: 58 },
};

const NAME_ALIASES: Record<string, string> = {
  'united states': 'USA',
  usa: 'USA',
  'ivory coast': 'CIV',
  "cote d'ivoire": 'CIV',
  'dr congo': 'COD',
  'democratic republic of the congo': 'COD',
  congo: 'COD',
  'bosnia and herzegovina': 'BIH',
  'bosnia & herzegovina': 'BIH',
  curacao: 'CUW',
  'cape verde': 'CPV',
  'saudi arabia': 'KSA',
  'south korea': 'KOR',
  korea: 'KOR',
  'south africa': 'RSA',
  'new zealand': 'NZL',
};

const DEFAULT = { rank: 60, overall: 52, attack: 51, defense: 52, midfield: 51 };

export function getTeamRating(name: string, code?: string) {
  if (code && RATINGS[code.toUpperCase()]) {
    return RATINGS[code.toUpperCase()];
  }
  const alias = NAME_ALIASES[name.trim().toLowerCase()];
  if (alias && RATINGS[alias]) return RATINGS[alias];

  const upper = name.toUpperCase().slice(0, 3);
  for (const [key, val] of Object.entries(RATINGS)) {
    if (name.toUpperCase().includes(key) || key === upper) return val;
  }
  return DEFAULT;
}

export function getAllRatings() {
  return RATINGS;
}
