import type { Team } from '../types';
import { TeamCard } from './TeamSelector';

interface TeamsViewProps {
  teams: Team[];
}

export function TeamsView({ teams }: TeamsViewProps) {
  return (
    <div>
      <div className="card predictor-hero">
        <h2>All 48 Teams</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Qualified nations for FIFA World Cup 2026 — data loaded live from{' '}
          <a href="https://worldcup26.ir" target="_blank" rel="noreferrer">worldcup26.ir</a>
          {' '}with strength ratings based on FIFA rankings.
        </p>
      </div>
      <div className="teams-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
