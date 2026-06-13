import { generateSquad, getScorers, pickLineup } from '../data/squads';
import type {
  Formation,
  MatchEvent,
  MatchStats,
  Player,
  SimulatedMatch,
  Team,
} from '../types';

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function teamStrength(team: Team, formation: Formation, lineup?: Player[]): number {
  const activeLineup = lineup ?? pickLineup(generateSquad(team), formation);
  const avg = activeLineup.reduce((s, p) => s + p.rating, 0) / activeLineup.length;
  const formBonus = (team.attack + team.midfield + team.defense) / 3;
  return avg * 0.6 + formBonus * 0.4;
}

function buildStats(homeStr: number, awayStr: number): MatchStats {
  const total = homeStr + awayStr;
  const homePoss = Math.round((homeStr / total) * 40 + 30 + rand(-5, 5));
  const awayPoss = 100 - homePoss;
  const homeShotBase = homeStr / 15;
  const awayShotBase = awayStr / 15;
  const homeShots = Math.round(homeShotBase + rand(2, 8));
  const awayShots = Math.round(awayShotBase + rand(2, 8));
  const homeOnTarget = Math.round(homeShots * rand(0.25, 0.55));
  const awayOnTarget = Math.round(awayShots * rand(0.25, 0.55));

  return {
    possession: [homePoss, awayPoss],
    shots: [homeShots, awayShots],
    shotsOnTarget: [homeOnTarget, awayOnTarget],
    corners: [Math.round(rand(2, 10)), Math.round(rand(2, 10))],
    fouls: [Math.round(rand(8, 18)), Math.round(rand(8, 18))],
    yellowCards: [0, 0],
    redCards: [0, 0],
    passes: [Math.round(homePoss * 4.5 + rand(50, 150)), Math.round(awayPoss * 4.5 + rand(50, 150))],
  };
}

function simulateGoals(
  homeLineup: ReturnType<typeof pickLineup>,
  awayLineup: ReturnType<typeof pickLineup>,
  homeStr: number,
  awayStr: number,
  isKnockout: boolean,
): { score: [number, number]; events: MatchEvent[]; stats: MatchStats } {
  const events: MatchEvent[] = [{ minute: 0, type: 'kickoff', team: 'home' }];
  const stats = buildStats(homeStr, awayStr);
  const homeScorers = getScorers(homeLineup);
  const awayScorers = getScorers(awayLineup);

  let homeGoals = 0;
  let awayGoals = 0;

  const homeLambda = (homeStr / 80) * 1.35;
  const awayLambda = (awayStr / 80) * 1.35;

  const totalEvents = Math.round(rand(18, 32));
  for (let i = 0; i < totalEvents; i++) {
    const minute = Math.min(90, Math.round(rand(1, 92)));
    const roll = Math.random();

    if (roll < 0.08) {
      const isHome = Math.random() < homeStr / (homeStr + awayStr);
      const team = isHome ? 'home' : 'away';
      const lineup = isHome ? homeLineup : awayLineup;
      const player = pickWeighted(lineup, lineup.map((p) => p.rating));
      events.push({ minute, type: 'foul', team, player: player.name });
      if (Math.random() < 0.15) {
        events.push({ minute, type: 'yellow_card', team, player: player.name });
        const idx = team === 'home' ? 0 : 1;
        stats.yellowCards[idx]++;
      }
    } else if (roll < 0.14) {
      const isHome = Math.random() < 0.5;
      events.push({ minute, type: 'corner', team: isHome ? 'home' : 'away' });
    } else if (roll < 0.22) {
      const isHome = Math.random() < homeStr / (homeStr + awayStr);
      const team = isHome ? 'home' : 'away';
      const scorers = isHome ? homeScorers : awayScorers;
      const player = scorers[Math.floor(Math.random() * scorers.length)];
      events.push({ minute, type: 'shot', team, player: player.name });
      if (Math.random() < 0.35) {
        events.push({ minute, type: 'save', team: isHome ? 'away' : 'home' });
      }
    } else if (roll < 0.22 + homeLambda * 0.06) {
      const player = homeScorers[Math.floor(Math.random() * homeScorers.length)];
      homeGoals++;
      events.push({ minute, type: 'goal', team: 'home', player: player.name, detail: 'Open play' });
    } else if (roll < 0.22 + homeLambda * 0.06 + awayLambda * 0.06) {
      const player = awayScorers[Math.floor(Math.random() * awayScorers.length)];
      awayGoals++;
      events.push({ minute, type: 'goal', team: 'away', player: player.name, detail: 'Open play' });
    }
  }

  events.push({ minute: 45, type: 'halftime', team: 'home', detail: `${homeGoals}-${awayGoals}` });

  if (Math.random() < 0.12) {
    const isHome = Math.random() < 0.5;
    const team = isHome ? 'home' : 'away';
    const outLineup = isHome ? homeLineup : awayLineup;
    const playerOut = outLineup[Math.floor(rand(6, outLineup.length - 1))];
    const playerIn = outLineup[Math.floor(rand(0, 5))];
    events.push({
      minute: Math.round(rand(60, 85)),
      type: 'substitution',
      team,
      playerOut: playerOut.name,
      playerIn: playerIn.name,
    });
  }

  if (isKnockout && homeGoals === awayGoals) {
    events.push({ minute: 90, type: 'extratime', team: 'home' });
    if (Math.random() < homeLambda / (homeLambda + awayLambda)) {
      homeGoals++;
      events.push({
        minute: 105,
        type: 'goal',
        team: 'home',
        player: homeScorers[0].name,
        detail: 'Extra time',
      });
    } else if (Math.random() < 0.5) {
      awayGoals++;
      events.push({
        minute: 108,
        type: 'goal',
        team: 'away',
        player: awayScorers[0].name,
        detail: 'Extra time',
      });
    }
  }

  events.push({ minute: 90, type: 'fulltime', team: 'home', detail: `${homeGoals}-${awayGoals}` });
  events.sort((a, b) => a.minute - b.minute);

  return { score: [homeGoals, awayGoals], events, stats };
}

function penaltyShootout(homeStr: number, awayStr: number): [number, number] {
  let homePens = 0;
  let awayPens = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < 0.72 + (homeStr - 70) * 0.005) homePens++;
    if (Math.random() < 0.72 + (awayStr - 70) * 0.005) awayPens++;
  }
  while (homePens === awayPens) {
    if (Math.random() < 0.75) homePens++;
    if (Math.random() < 0.75) awayPens++;
  }
  return [homePens, awayPens];
}

export function simulateMatch(
  home: Team,
  away: Team,
  homeFormation: Formation,
  awayFormation: Formation,
  options: { homeLineup?: Player[]; awayLineup?: Player[]; isKnockout?: boolean } = {},
): SimulatedMatch {
  const homeSquad = generateSquad(home);
  const awaySquad = generateSquad(away);
  const homeLineup = options.homeLineup ?? pickLineup(homeSquad, homeFormation);
  const awayLineup = options.awayLineup ?? pickLineup(awaySquad, awayFormation);
  const homeStr = teamStrength(home, homeFormation, homeLineup);
  const awayStr = teamStrength(away, awayFormation, awayLineup);
  const isKnockout = options.isKnockout ?? false;

  const { score, events, stats } = simulateGoals(
    homeLineup,
    awayLineup,
    homeStr,
    awayStr,
    isKnockout,
  );

  let penScore: [number, number] | undefined;
  if (isKnockout && score[0] === score[1]) {
    penScore = penaltyShootout(homeStr, awayStr);
    events.push({
      minute: 120,
      type: 'penalties',
      team: 'home',
      detail: `${penScore[0]}-${penScore[1]} on penalties`,
    });
  }

  let winner: 'home' | 'away' | 'draw' = 'draw';
  if (score[0] > score[1]) winner = 'home';
  else if (score[1] > score[0]) winner = 'away';
  else if (penScore) winner = penScore[0] > penScore[1] ? 'home' : 'away';

  return {
    home,
    away,
    homeFormation,
    awayFormation,
    homeLineup,
    awayLineup,
    score,
    penScore,
    events,
    stats,
    winner,
  };
}

export function quickPredict(home: Team, away: Team): { homeWin: number; draw: number; awayWin: number } {
  const diff = home.rating - away.rating;
  const homeAdv = 3;
  const adjusted = diff + homeAdv;
  const homeWin = Math.round(Math.min(85, Math.max(10, 33 + adjusted * 2.2)));
  const awayWin = Math.round(Math.min(85, Math.max(10, 33 - adjusted * 2.2)));
  const draw = 100 - homeWin - awayWin;
  return { homeWin, draw: Math.max(5, draw), awayWin };
}
