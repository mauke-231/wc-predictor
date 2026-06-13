import type { SimulatedMatch } from '../types';

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  own_goal: '⚽',
  penalty_goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
  shot: '🎯',
  save: '🧤',
  corner: '🚩',
  kickoff: '▶️',
  halftime: '⏸️',
  fulltime: '🏁',
  extratime: '⏱️',
  penalties: '🎯',
  foul: '⚠️',
};

interface MatchResultProps {
  match: SimulatedMatch;
}

export function MatchResult({ match }: MatchResultProps) {
  const { home, away, score, penScore, events, stats } = match;
  const scoreText = penScore
    ? `${score[0]} - ${score[1]} (${penScore[0]}-${penScore[1]} pens)`
    : `${score[0]} - ${score[1]}`;

  const notableEvents = events.filter((e) =>
    ['goal', 'yellow_card', 'red_card', 'substitution', 'penalties', 'halftime', 'fulltime'].includes(e.type),
  );

  return (
    <div className="match-result">
      <div className="scoreboard">
        <div className="scoreboard-team">
          <img src={home.flag} alt={home.name} className="team-flag-lg" />
          <span>{home.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{match.homeFormation.label}</span>
        </div>
        <div className="score-display">{scoreText}</div>
        <div className="scoreboard-team">
          <img src={away.flag} alt={away.name} className="team-flag-lg" />
          <span>{away.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{match.awayFormation.label}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h4 className="card-title">Match Stats</h4>
          <StatBar label="Possession" home={stats.possession[0]} away={stats.possession[1]} suffix="%" />
          <StatBar label="Shots" home={stats.shots[0]} away={stats.shots[1]} />
          <StatBar label="On Target" home={stats.shotsOnTarget[0]} away={stats.shotsOnTarget[1]} />
          <StatBar label="Corners" home={stats.corners[0]} away={stats.corners[1]} />
          <StatBar label="Fouls" home={stats.fouls[0]} away={stats.fouls[1]} />
          <StatBar label="Yellow Cards" home={stats.yellowCards[0]} away={stats.yellowCards[1]} />
        </div>

        <div className="card">
          <h4 className="card-title">Match Events</h4>
          <div className="events-timeline">
            {notableEvents.map((event, i) => (
              <div key={i} className={`event-item ${event.team}`}>
                <span className="event-minute">{event.minute}&apos;</span>
                <span className="event-icon">{EVENT_ICONS[event.type] ?? '•'}</span>
                <span>
                  {event.player && <strong>{event.player}</strong>}
                  {event.playerOut && event.playerIn && (
                    <span> {event.playerOut} → {event.playerIn}</span>
                  )}
                  {event.detail && !event.player && !event.playerOut && (
                    <span> {event.detail}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h4 className="card-title">{home.name} Lineup</h4>
          <LineupList lineup={match.homeLineup} />
        </div>
        <div className="card">
          <h4 className="card-title">{away.name} Lineup</h4>
          <LineupList lineup={match.awayLineup} />
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, home, away, suffix = '' }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1;
  return (
    <div className="stats-bar-row">
      <span className="stat-home">{home}{suffix}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-away">{away}{suffix}</span>
      <div className="stat-bar" style={{ gridColumn: 1 }}>
        <div className="stat-bar-fill home" style={{ width: `${(home / total) * 100}%` }} />
      </div>
      <div className="stat-bar" style={{ gridColumn: 3 }}>
        <div className="stat-bar-fill away" style={{ width: `${(away / total) * 100}%` }} />
      </div>
    </div>
  );
}

function LineupList({ lineup }: { lineup: SimulatedMatch['homeLineup'] }) {
  return (
    <div className="lineup-list">
      {lineup.map((p) => (
        <div key={p.id} className="lineup-row">
          <span>
            <span className="number">{p.number}</span> {p.name}
          </span>
          <span>
            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{p.position}</span>
            <span className="rating">{p.rating}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
