export interface ApiTeam {
  id: string;
  name_en: string;
  name_fa?: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
}

export interface ApiGroup {
  group: string;
  teams: ApiTeam[];
}

export interface ApiMatch {
  _id?: string;
  team1: string;
  team2: string;
  team1_en?: string;
  team2_en?: string;
  team1_flag?: string;
  team2_flag?: string;
  date: string;
  time?: string;
  group?: string;
  round?: string;
  stadium?: string;
  score1?: number | null;
  score2?: number | null;
  status?: string;
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  code: string;
  iso2: string;
  group: string;
  rating: number;
  rank: number;
  attack: number;
  defense: number;
  midfield: number;
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  position: Position;
  rating: number;
  number: number;
}

export interface Formation {
  id: string;
  label: string;
  slots: Position[];
}

export type MatchEventType =
  | 'kickoff'
  | 'goal'
  | 'own_goal'
  | 'penalty_goal'
  | 'missed_penalty'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'shot'
  | 'save'
  | 'corner'
  | 'offside'
  | 'foul'
  | 'halftime'
  | 'fulltime'
  | 'extratime'
  | 'penalties';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  team: 'home' | 'away';
  player?: string;
  playerOut?: string;
  playerIn?: string;
  detail?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passes: [number, number];
}

export interface SimulatedMatch {
  home: Team;
  away: Team;
  homeFormation: Formation;
  awayFormation: Formation;
  homeLineup: Player[];
  awayLineup: Player[];
  score: [number, number];
  penScore?: [number, number];
  events: MatchEvent[];
  stats: MatchStats;
  winner: 'home' | 'away' | 'draw';
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface KnockoutMatch {
  id: string;
  round: string;
  home: Team | null;
  away: Team | null;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  result?: SimulatedMatch;
}

export interface TournamentPrediction {
  groups: Record<string, GroupStanding[]>;
  thirdPlace: Team[];
  knockout: KnockoutMatch[];
  champion: Team;
  runnerUp: Team;
  topScorer: { player: string; team: string; goals: number };
}

export interface MatchSetup {
  home: Team;
  away: Team;
  homeFormation: Formation;
  awayFormation: Formation;
}
