import type { ApiGroup, ApiMatch, ApiTeam, Team } from '../types';
import { getTeamRating } from '../data/teamRatings';

const API_BASE = '/api/wc';
const FALLBACK_TEAMS_URL = 'https://worldcup26.ir/get/teams';
const FALLBACK_GAMES_URL = 'https://worldcup26.ir/get/games';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function normalizeTeam(apiTeam: ApiTeam): Team {
  const rating = getTeamRating(apiTeam.name_en, apiTeam.fifa_code);
  return {
    id: apiTeam.id,
    name: apiTeam.name_en,
    flag: apiTeam.flag,
    code: apiTeam.fifa_code,
    iso2: apiTeam.iso2,
    group: apiTeam.groups,
    rating: rating.overall,
    rank: rating.rank,
    attack: rating.attack,
    defense: rating.defense,
    midfield: rating.midfield,
  };
}

export async function fetchTeams(): Promise<Team[]> {
  try {
    const data = await fetchJson<{ teams: ApiTeam[] }>(`${API_BASE}/teams`);
    return data.teams.map(normalizeTeam).sort((a, b) => a.rank - b.rank);
  } catch {
    const data = await fetchJson<{ teams: ApiTeam[] }>(FALLBACK_TEAMS_URL);
    return data.teams.map(normalizeTeam).sort((a, b) => a.rank - b.rank);
  }
}

export async function fetchGroups(): Promise<Record<string, Team[]>> {
  try {
    const data = await fetchJson<{ groups: ApiGroup[] }>(`${API_BASE}/groups`);
    return Object.fromEntries(
      data.groups.map((g) => [g.group, g.teams.map(normalizeTeam)]),
    );
  } catch {
    const teams = await fetchTeams();
    const groups: Record<string, Team[]> = {};
    for (const team of teams) {
      if (!groups[team.group]) groups[team.group] = [];
      groups[team.group].push(team);
    }
    return groups;
  }
}

export async function fetchMatches(): Promise<ApiMatch[]> {
  try {
    const data = await fetchJson<{ games: ApiMatch[] }>(`${API_BASE}/games`);
    return data.games;
  } catch {
    const data = await fetchJson<{ games: ApiMatch[] }>(FALLBACK_GAMES_URL);
    return data.games;
  }
}

export function findTeam(teams: Team[], name: string): Team | undefined {
  const normalized = name.trim().toLowerCase();
  return teams.find(
    (t) =>
      t.name.toLowerCase() === normalized ||
      t.code.toLowerCase() === normalized ||
      t.name.toLowerCase().includes(normalized),
  );
}
