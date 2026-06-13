import type { Formation, Player, Position, Team } from '../types';
import { REAL_SQUADS } from './realSquads';

const FIRST_NAMES = [
  'James', 'Lucas', 'Marco', 'Diego', 'Ahmed', 'Yuki', 'Pierre', 'Carlos', 'Ivan', 'Omar',
  'Felix', 'Noah', 'Leo', 'Mateo', 'Kai', 'Hassan', 'Joon', 'Luis', 'Nikolai', 'Samuel',
  'Andre', 'Bruno', 'Chen', 'David', 'Erik', 'Finn', 'Giorgio', 'Hugo', 'Ismael', 'Jan',
];

const LAST_NAMES = [
  'Silva', 'Garcia', 'Muller', 'Santos', 'Kim', 'Rossi', 'Martinez', 'Petrov', 'Ali', 'Nguyen',
  'Costa', 'Fernandez', 'Schmidt', 'Okonkwo', 'Tanaka', 'Dubois', 'Hernandez', 'Ivanov', 'Hassan', 'Lee',
  'Brown', 'Wilson', 'Chen', 'Patel', 'Kowalski', 'Johansson', 'Okafor', 'Reyes', 'Novak', 'Sato',
];

const STAR_NAMES: Record<string, string[]> = {
  ARG: ['Emiliano Martínez', 'Cristian Romero', 'Enzo Fernández', 'Alexis Mac Allister', 'Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez'],
  FRA: ['Mike Maignan', 'William Saliba', 'Aurélien Tchouaméni', 'Antoine Griezmann', 'Kylian Mbappé', 'Ousmane Dembélé', 'Olivier Giroud'],
  BRA: ['Alisson', 'Marquinhos', 'Casemiro', 'Rodrygo', 'Vinícius Júnior', 'Neymar', 'Richarlison'],
  ENG: ['Jordan Pickford', 'John Stones', 'Declan Rice', 'Jude Bellingham', 'Phil Foden', 'Bukayo Saka', 'Harry Kane'],
  GER: ['Manuel Neuer', 'Joshua Kimmich', 'Florian Wirtz', 'Jamal Musiala', 'Kai Havertz', 'Niclas Füllkrug', 'Leroy Sané'],
  ESP: ['Unai Simón', 'Aymeric Laporte', 'Rodri', 'Pedri', 'Gavi', 'Lamine Yamal', 'Álvaro Morata'],
  POR: ['Diogo Costa', 'Rúben Dias', 'Bruno Fernandes', 'Bernardo Silva', 'Rafael Leão', 'Cristiano Ronaldo', 'Diogo Jota'],
  NED: ['Virgil van Dijk', 'Frenkie de Jong', 'Memphis Depay', 'Cody Gakpo', 'Steven Bergwijn', 'Xavi Simons', 'Brian Brobbey'],
  MEX: ['Guillermo Ochoa', 'Edson Álvarez', 'Héctor Herrera', 'Luis Chávez', 'Hirving Lozano', 'Raúl Jiménez', 'Santiago Giménez'],
  USA: ['Matt Turner', 'Tyler Adams', 'Weston McKennie', 'Christian Pulisic', 'Giovanni Reyna', 'Folarin Balogun', 'Tim Weah'],
  CAN: ['Milan Borjan', 'Alphonso Davies', 'Jonathan David', 'Alphonso Davies', 'Tajon Buchanan', 'Cyle Larin', 'Sam Adekugbe'],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateName(teamCode: string, index: number, position: Position): string {
  const stars = STAR_NAMES[teamCode];
  if (stars && index < stars.length) return stars[index];
  const rand = seededRandom(hashString(`${teamCode}-${index}-${position}`));
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function positionRating(team: Team, position: Position, slotIndex: number): number {
  const variance = ((hashString(`${team.code}-${slotIndex}`) % 11) - 5);
  const base =
    position === 'GK'
      ? team.defense
      : position === 'DEF'
        ? team.defense
        : position === 'MID'
          ? team.midfield
          : team.attack;
  return Math.max(45, Math.min(95, base + variance));
}

export function generateSquad(team: Team): Player[] {
  const realSquad = REAL_SQUADS[team.code];
  if (realSquad && realSquad.length > 0) {
    return realSquad;
  }

  const positions: Position[] = [
    'GK', 'GK', 'GK',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD', 'FWD', 'FWD',
  ];

  return positions.map((position, i) => ({
    id: `${team.code}-${i}`,
    name: generateName(team.code, i, position),
    position,
    rating: positionRating(team, position, i),
    number: i === 0 ? 1 : i + 1,
  }));
}

export function pickLineup(squad: Player[], formation: Formation): Player[] {
  const byPos: Record<Position, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of squad) byPos[p.position].push(p);
  for (const pos of Object.keys(byPos) as Position[]) {
    byPos[pos].sort((a, b) => b.rating - a.rating);
  }

  const lineup: Player[] = [];
  const needed: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const slot of formation.slots) needed[slot]++;

  for (const pos of ['GK', 'DEF', 'MID', 'FWD'] as Position[]) {
    lineup.push(...byPos[pos].slice(0, needed[pos]));
  }
  return lineup;
}

export function getStarPlayer(lineup: Player[]): Player {
  return lineup.reduce((best, p) => (p.rating > best.rating ? p : best), lineup[0]);
}

export function getScorers(lineup: Player[], count = 3): Player[] {
  return [...lineup]
    .filter((p) => p.position === 'FWD' || p.position === 'MID')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}
