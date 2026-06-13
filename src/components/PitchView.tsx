import type { Player } from '../types';
import { getPitchPositions } from '../data/formations';

interface PitchViewProps {
  homeLineup: Player[];
  awayLineup: Player[];
  homeFormationId: string;
  awayFormationId: string;
  homeName: string;
  awayName: string;
}

export function PitchView({
  homeLineup,
  awayLineup,
  homeFormationId,
  awayFormationId,
  homeName,
  awayName,
}: PitchViewProps) {
  const homePositions = getPitchPositions(homeFormationId, 'home');
  const awayPositions = getPitchPositions(awayFormationId, 'away');

  return (
    <div>
      <div className="pitch-header">
        <span className="team-side home">{homeName}</span>
        <span className="team-side away">{awayName}</span>
      </div>
      <div className="pitch-container">
        <svg className="pitch-svg" viewBox="0 0 105 68" preserveAspectRatio="xMidYMid slice">
          {/* Outer boundary */}
          <rect x="0.5" y="0.5" width="104" height="67" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Goal posts - home */}
          <rect x="0" y="28.5" width="0.4" height="11" fill="rgba(255,255,255,0.8)" />
          {/* Goal net / goal box (home) */}
          <rect x="0.4" y="30" width="2.2" height="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.2" />
          <path d="M 2.6 30 L 2.6 38" stroke="rgba(255,255,255,0.25)" strokeWidth="0.2" />
          
          {/* Goal posts - away */}
          <rect x="104.6" y="28.5" width="0.4" height="11" fill="rgba(255,255,255,0.8)" />
          {/* Goal net / goal box (away) */}
          <rect x="102.2" y="30" width="2.2" height="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.2" />
          <path d="M 102.2 30 L 102.2 38" stroke="rgba(255,255,255,0.25)" strokeWidth="0.2" />

          
          {/* Center line */}
          <line x1="52.5" y1="0.5" x2="52.5" y2="67.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Center circle */}
          <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Center spot */}
          <circle cx="52.5" cy="34" r="0.5" fill="rgba(255,255,255,0.8)" />
          
          {/* Penalty area - home (left) */}
          <rect x="0.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Goal area - home */}
          <rect x="0.5" y="24.64" width="5.5" height="18.72" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Penalty spot - home */}
          <circle cx="11" cy="34" r="0.5" fill="rgba(255,255,255,0.8)" />
          
          {/* Arc above penalty area - home */}
          <path d="M 3.2 13.84 A 9.15 9.15 0 0 0 3.2 54.16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
          
          {/* Penalty area - away (right) */}
          <rect x="88" y="13.84" width="16.5" height="40.32" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Goal area - away */}
          <rect x="99" y="24.64" width="5.5" height="18.72" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
          
          {/* Penalty spot - away */}
          <circle cx="94" cy="34" r="0.5" fill="rgba(255,255,255,0.8)" />
          
          {/* Arc above penalty area - away */}
          <path d="M 101.8 13.84 A 9.15 9.15 0 0 1 101.8 54.16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
          
          {/* Corner arcs - all four corners */}
          <path d="M 0.5 1 A 1 1 0 0 1 1.5 0.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.3" />
          <path d="M 0.5 67 A 1 1 0 0 0 1.5 67.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.3" />
          <path d="M 104.5 1 A 1 1 0 0 0 103.5 0.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.3" />
          <path d="M 104.5 67 A 1 1 0 0 1 103.5 67.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.3" />
        </svg>
        {homeLineup.map((player, i) => (
          <div
            key={`h-${player.id}`}
            className="pitch-player home"
            style={{ left: `${homePositions[i]?.x ?? 50}%`, top: `${homePositions[i]?.y ?? 50}%` }}
            title={`${player.name} (${player.rating})`}
          >
            <div className="pitch-player-dot">{player.number}</div>
            <span className="pitch-player-name">{player.name.split(' ').pop()}</span>
          </div>
        ))}
        {awayLineup.map((player, i) => (
          <div
            key={`a-${player.id}`}
            className="pitch-player away"
            style={{ left: `${awayPositions[i]?.x ?? 50}%`, top: `${awayPositions[i]?.y ?? 50}%` }}
            title={`${player.name} (${player.rating})`}
          >
            <div className="pitch-player-dot">{player.number}</div>
            <span className="pitch-player-name">{player.name.split(' ').pop()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
