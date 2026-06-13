import type { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  label: string;
  excludeId?: string;
}

export function TeamSelector({ teams, value, onChange, label, excludeId }: TeamSelectorProps) {
  const options = teams.filter((t) => t.id !== excludeId);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {label}
      </label>
      <select className="team-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a team...</option>
        {options.map((team) => (
          <option key={team.id} value={team.id}>
            #{team.rank} {team.name} (Group {team.group}) — OVR {team.rating}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TeamCard({ team }: { team: Team }) {
  return (
    <div className="team-card">
      <span className="rank">#{team.rank}</span>
      <img src={team.flag} alt={team.name} className="team-flag-lg" />
      <span className="name">{team.name}</span>
      <span className="rating">OVR {team.rating}</span>
      <span className="group-tag">Group {team.group}</span>
    </div>
  );
}
