import type { Formation } from '../types';

export const FORMATIONS: Formation[] = [
  {
    id: '4-3-3',
    label: '4-3-3',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'],
  },
  {
    id: '4-4-2',
    label: '4-4-2',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD'],
  },
  {
    id: '4-2-3-1',
    label: '4-2-3-1',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD'],
  },
  {
    id: '3-5-2',
    label: '3-5-2',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD'],
  },
  {
    id: '3-4-3',
    label: '3-4-3',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'],
  },
  {
    id: '5-3-2',
    label: '5-3-2',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD'],
  },
  {
    id: '4-1-4-1',
    label: '4-1-4-1',
    slots: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD'],
  },
];

export function getFormation(id: string): Formation {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[0];
}

export const FORMATION_POSITIONS: Record<string, { x: number; y: number }[]> = {
  '4-3-3': [
    { x: 50, y: 92 },
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 },
    { x: 25, y: 52 }, { x: 50, y: 50 }, { x: 75, y: 52 },
    { x: 20, y: 25 }, { x: 50, y: 18 }, { x: 80, y: 25 },
  ],
  '4-4-2': [
    { x: 50, y: 92 },
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 },
    { x: 12, y: 48 }, { x: 37, y: 50 }, { x: 63, y: 50 }, { x: 88, y: 48 },
    { x: 35, y: 22 }, { x: 65, y: 22 },
  ],
  '4-2-3-1': [
    { x: 50, y: 92 },
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 },
    { x: 35, y: 58 }, { x: 65, y: 58 },
    { x: 18, y: 38 }, { x: 50, y: 35 }, { x: 82, y: 38 },
    { x: 50, y: 18 },
  ],
  '3-5-2': [
    { x: 50, y: 92 },
    { x: 25, y: 74 }, { x: 50, y: 76 }, { x: 75, y: 74 },
    { x: 10, y: 52 }, { x: 30, y: 50 }, { x: 50, y: 48 }, { x: 70, y: 50 }, { x: 90, y: 52 },
    { x: 35, y: 22 }, { x: 65, y: 22 },
  ],
  '3-4-3': [
    { x: 50, y: 92 },
    { x: 25, y: 74 }, { x: 50, y: 76 }, { x: 75, y: 74 },
    { x: 15, y: 50 }, { x: 40, y: 48 }, { x: 60, y: 48 }, { x: 85, y: 50 },
    { x: 20, y: 25 }, { x: 50, y: 18 }, { x: 80, y: 25 },
  ],
  '5-3-2': [
    { x: 50, y: 92 },
    { x: 10, y: 70 }, { x: 30, y: 74 }, { x: 50, y: 76 }, { x: 70, y: 74 }, { x: 90, y: 70 },
    { x: 30, y: 48 }, { x: 50, y: 46 }, { x: 70, y: 48 },
    { x: 35, y: 22 }, { x: 65, y: 22 },
  ],
  '4-1-4-1': [
    { x: 50, y: 92 },
    { x: 15, y: 72 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 72 },
    { x: 50, y: 58 },
    { x: 12, y: 42 }, { x: 37, y: 40 }, { x: 63, y: 40 }, { x: 88, y: 42 },
    { x: 50, y: 18 },
  ],
};

export function getPitchPositions(formationId: string, side: 'home' | 'away') {
  const base = FORMATION_POSITIONS[formationId] ?? FORMATION_POSITIONS['4-3-3'];
  return base.map((p, idx) => {
    const x = side === 'home'
      ? 10 + (100 - p.y) * 0.35
      : 90 - (100 - p.y) * 0.35;

    // Keeper sits just inside the goal box (was slightly forward).
    // In our formations, GK is the first slot (index 0).
    const isKeeper = idx === 0;
    const y = isKeeper ? (10 + p.x * 0.8) + 1.2 : 10 + p.x * 0.8;

    return { x, y };
  });
}
