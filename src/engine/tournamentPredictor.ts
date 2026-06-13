import { getFormation } from '../data/formations';
import { simulateMatch } from './matchSimulator';
import type {
  GroupStanding,
  KnockoutMatch,
  Team,
  TournamentPrediction,
} from '../types';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function initStanding(team: Team): GroupStanding {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

function updateStanding(standing: GroupStanding, gf: number, ga: number) {
  standing.played++;
  standing.gf += gf;
  standing.ga += ga;
  standing.gd = standing.gf - standing.ga;
  if (gf > ga) {
    standing.won++;
    standing.points += 3;
  } else if (gf === ga) {
    standing.drawn++;
    standing.points += 1;
  } else {
    standing.lost++;
  }
}

function sortStandings(standings: GroupStanding[]): GroupStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.team.rating - a.team.rating;
  });
}

function playGroupStage(groups: Record<string, Team[]>): Record<string, GroupStanding[]> {
  const result: Record<string, GroupStanding[]> = {};
  const defaultFormation = getFormation('4-3-3');

  for (const groupKey of GROUPS) {
    const teams = groups[groupKey];
    if (!teams || teams.length < 4) continue;

    const standings = teams.map(initStanding);
    const indices = [
      [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
    ];

    for (const [i, j] of indices) {
      const match = simulateMatch(teams[i], teams[j], defaultFormation, defaultFormation);
      updateStanding(standings[i], match.score[0], match.score[1]);
      updateStanding(standings[j], match.score[1], match.score[0]);
    }

    result[groupKey] = sortStandings(standings);
  }

  return result;
}

function getThirdPlaceTeams(groupResults: Record<string, GroupStanding[]>): Team[] {
  const thirds = GROUPS.map((g) => groupResults[g]?.[2]?.team).filter(Boolean) as Team[];
  return thirds.sort((a, b) => b.rating - a.rating).slice(0, 8);
}

function resolvePlaceholder(placeholder: string, groupResults: Record<string, GroupStanding[]>, thirdPlace: Team[]): Team | null {
  const posMatch = placeholder.match(/^(\d)([A-L])$/);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10) - 1;
    const group = posMatch[2];
    return groupResults[group]?.[pos]?.team ?? null;
  }

  if (placeholder.startsWith('3')) {
    const groupOptions = placeholder.replace('3', '').split('/');
    for (const g of groupOptions) {
      const third = groupResults[g]?.[2]?.team;
      if (third && thirdPlace.includes(third)) return third;
    }
    return thirdPlace[0] ?? null;
  }

  return null;
}

function buildKnockoutBracket(
  groupResults: Record<string, GroupStanding[]>,
  thirdPlace: Team[],
): KnockoutMatch[] {
  const r32Fixtures: Array<{ id: string; round: string; home: string; away: string }> = [
    { id: 'R32-1', round: 'Round of 32', home: '2A', away: '2B' },
    { id: 'R32-2', round: 'Round of 32', home: '1E', away: '3A/B/C/D/F' },
    { id: 'R32-3', round: 'Round of 32', home: '1F', away: '2C' },
    { id: 'R32-4', round: 'Round of 32', home: '1C', away: '2F' },
    { id: 'R32-5', round: 'Round of 32', home: '1I', away: '3C/D/F/G/H' },
    { id: 'R32-6', round: 'Round of 32', home: '2E', away: '2I' },
    { id: 'R32-7', round: 'Round of 32', home: '1A', away: '3C/E/F/H/I' },
    { id: 'R32-8', round: 'Round of 32', home: '1L', away: '3E/H/I/J/K' },
    { id: 'R32-9', round: 'Round of 32', home: '1D', away: '3B/E/F/I/J' },
    { id: 'R32-10', round: 'Round of 32', home: '1G', away: '3A/E/H/I/J' },
    { id: 'R32-11', round: 'Round of 32', home: '2K', away: '2L' },
    { id: 'R32-12', round: 'Round of 32', home: '1H', away: '2J' },
    { id: 'R32-13', round: 'Round of 32', home: '1B', away: '3E/F/G/I/J' },
    { id: 'R32-14', round: 'Round of 32', home: '1J', away: '2H' },
    { id: 'R32-15', round: 'Round of 32', home: '1K', away: '3D/E/I/J/L' },
    { id: 'R32-16', round: 'Round of 32', home: '2D', away: '2G' },
  ];

  const knockout: KnockoutMatch[] = r32Fixtures.map((f) => ({
    id: f.id,
    round: f.round,
    home: resolvePlaceholder(f.home, groupResults, thirdPlace),
    away: resolvePlaceholder(f.away, groupResults, thirdPlace),
    homePlaceholder: f.home,
    awayPlaceholder: f.away,
  }));

  const laterRounds = [
    { id: 'R16-1', round: 'Round of 16', home: 'W-R32-2', away: 'W-R32-5' },
    { id: 'R16-2', round: 'Round of 16', home: 'W-R32-1', away: 'W-R32-3' },
    { id: 'R16-3', round: 'Round of 16', home: 'W-R32-4', away: 'W-R32-6' },
    { id: 'R16-4', round: 'Round of 16', home: 'W-R32-7', away: 'W-R32-8' },
    { id: 'R16-5', round: 'Round of 16', home: 'W-R32-11', away: 'W-R32-12' },
    { id: 'R16-6', round: 'Round of 16', home: 'W-R32-9', away: 'W-R32-10' },
    { id: 'R16-7', round: 'Round of 16', home: 'W-R32-14', away: 'W-R32-16' },
    { id: 'R16-8', round: 'Round of 16', home: 'W-R32-13', away: 'W-R32-15' },
    { id: 'QF-1', round: 'Quarter-final', home: 'W-R16-1', away: 'W-R16-2' },
    { id: 'QF-2', round: 'Quarter-final', home: 'W-R16-5', away: 'W-R16-6' },
    { id: 'QF-3', round: 'Quarter-final', home: 'W-R16-3', away: 'W-R16-4' },
    { id: 'QF-4', round: 'Quarter-final', home: 'W-R16-7', away: 'W-R16-8' },
    { id: 'SF-1', round: 'Semi-final', home: 'W-QF-1', away: 'W-QF-2' },
    { id: 'SF-2', round: 'Semi-final', home: 'W-QF-3', away: 'W-QF-4' },
    { id: 'FINAL', round: 'Final', home: 'W-SF-1', away: 'W-SF-2' },
  ];

  for (const f of laterRounds) {
    knockout.push({
      id: f.id,
      round: f.round,
      home: null,
      away: null,
      homePlaceholder: f.home,
      awayPlaceholder: f.away,
    });
  }

  return knockout;
}

function getWinner(match: KnockoutMatch): Team | null {
  if (!match.result) return null;
  return match.result.winner === 'home' ? match.home : match.result.winner === 'away' ? match.away : null;
}

function resolveKnockout(knockout: KnockoutMatch[]): KnockoutMatch[] {
  const results = new Map<string, KnockoutMatch>();
  const defaultFormation = getFormation('4-3-3');

  for (const match of knockout) {
    if (match.homePlaceholder?.startsWith('W-')) {
      const prevId = match.homePlaceholder.replace('W-', '');
      match.home = getWinner(results.get(prevId)!) ?? match.home;
    }
    if (match.awayPlaceholder?.startsWith('W-')) {
      const prevId = match.awayPlaceholder.replace('W-', '');
      match.away = getWinner(results.get(prevId)!) ?? match.away;
    }

    if (match.home && match.away) {
      match.result = simulateMatch(match.home, match.away, defaultFormation, defaultFormation, { isKnockout: true });

      results.set(match.id, match);
    }
  }

  return knockout;
}

export function predictTournament(groups: Record<string, Team[]>): TournamentPrediction {
  const groupResults = playGroupStage(groups);
  const thirdPlace = getThirdPlaceTeams(groupResults);
  const knockout = resolveKnockout(buildKnockoutBracket(groupResults, thirdPlace));

  const final = knockout.find((m) => m.round === 'Final');
  const champion = final?.result
    ? final.result.winner === 'home'
      ? final.home!
      : final.away!
    : groupResults['A'][0].team;

  const runnerUp = final?.result
    ? final.result.winner === 'home'
      ? final.away!
      : final.home!
    : groupResults['A'][1].team;

  const goalEvents = knockout.flatMap((m) =>
    (m.result?.events ?? [])
      .filter((e) => e.type === 'goal' && e.player)
      .map((e) => ({
        player: e.player!,
        team: e.team === 'home' ? m.home!.name : m.away!.name,
      })),
  );

  const scorerCounts = new Map<string, { player: string; team: string; goals: number }>();
  for (const g of goalEvents) {
    const key = `${g.player}-${g.team}`;
    const existing = scorerCounts.get(key) ?? { player: g.player, team: g.team, goals: 0 };
    existing.goals++;
    scorerCounts.set(key, existing);
  }

  const topScorer = [...scorerCounts.values()].sort((a, b) => b.goals - a.goals)[0] ?? {
    player: 'Unknown',
    team: champion.name,
    goals: 0,
  };

  return {
    groups: groupResults,
    thirdPlace,
    knockout,
    champion,
    runnerUp,
    topScorer,
  };
}

export function runMultipleSimulations(
  groups: Record<string, Team[]>,
  runs: number,
): Map<string, number> {
  const wins = new Map<string, number>();
  for (let i = 0; i < runs; i++) {
    const result = predictTournament(groups);
    wins.set(result.champion.name, (wins.get(result.champion.name) ?? 0) + 1);
  }
  return wins;
}
