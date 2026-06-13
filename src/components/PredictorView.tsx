import { useState } from 'react';
import { predictTournament, runMultipleSimulations } from '../engine/tournamentPredictor';
import type { Team, TournamentPrediction } from '../types';

interface PredictorViewProps {
  teams: Team[];
  groups: Record<string, Team[]>;
}

export function PredictorView({ teams, groups }: PredictorViewProps) {
  const [prediction, setPrediction] = useState<TournamentPrediction | null>(null);
  const [monteCarlo, setMonteCarlo] = useState<Map<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [mcLoading, setMcLoading] = useState(false);

  function handlePredict() {
    setLoading(true);
    setTimeout(() => {
      setPrediction(predictTournament(groups));
      setLoading(false);
    }, 800);
  }

  function handleMonteCarlo() {
    setMcLoading(true);
    setTimeout(() => {
      setMonteCarlo(runMultipleSimulations(groups, 100));
      setMcLoading(false);
    }, 1500);
  }

  const mcSorted = monteCarlo
    ? [...monteCarlo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];

  return (
    <div>
      <div className="card predictor-hero">
        <h2>Tournament Predictor</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Simulate the entire 2026 World Cup — group stage through the final — using team ratings from FIFA rankings
          and live squad data from the World Cup API.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={handlePredict} disabled={loading}>
            {loading ? 'Simulating Tournament...' : '🏆 Predict World Cup'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleMonteCarlo} disabled={mcLoading}>
            {mcLoading ? 'Running 100 simulations...' : '📊 Monte Carlo (100 runs)'}
          </button>
        </div>
      </div>

      {prediction && (
        <>
          <div className="champion-display">
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <img src={prediction.champion.flag} alt={prediction.champion.name} />
            <h3>{prediction.champion.name}</h3>
            <p className="champion-meta">
              Predicted World Cup 2026 Champion · Runner-up: {prediction.runnerUp.name}
            </p>
            <p className="champion-meta">
              Golden Boot: {prediction.topScorer.player} ({prediction.topScorer.team}) — {prediction.topScorer.goals} goals
            </p>
          </div>

          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Group Stage Results</h3>
          <div className="groups-grid">
            {Object.entries(prediction.groups).map(([group, standings]) => (
              <div key={group} className="card group-card">
                <h4>GROUP {group}</h4>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>P</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GD</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.team.id} className={i < 2 ? 'qualified' : i === 2 ? 'third' : ''}>
                        <td>
                          <img src={s.team.flag} alt="" className="team-flag" />
                          {s.team.name}
                        </td>
                        <td>{s.played}</td>
                        <td>{s.won}</td>
                        <td>{s.drawn}</td>
                        <td>{s.lost}</td>
                        <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                        <td><strong>{s.points}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h4 className="card-title">Knockout Stage</h4>
            <div className="knockout-list">
              {prediction.knockout
                .filter((m) => m.result)
                .map((m) => (
                  <div key={m.id} className="knockout-match">
                    <span className="round-label">{m.round}</span>
                    <span className="match-teams">
                      {m.home?.name} vs {m.away?.name}
                    </span>
                    <span className="match-score">
                      {m.result!.score[0]}-{m.result!.score[1]}
                      {m.result!.penScore && ` (${m.result!.penScore[0]}-${m.result!.penScore[1]})`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {mcSorted.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h4 className="card-title">Title Odds (100 Simulations)</h4>
          <ul className="monte-carlo-list">
            {mcSorted.map(([name, wins]) => {
              const team = teams.find((t) => t.name === name);
              return (
                <li key={name}>
                  {team && <img src={team.flag} alt="" className="team-flag" />}
                  <span style={{ minWidth: '140px', fontWeight: 600 }}>{name}</span>
                  <div className="monte-carlo-bar">
                    <div className="monte-carlo-fill" style={{ width: `${wins}%` }} />
                  </div>
                  <span style={{ minWidth: '40px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>
                    {wins}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
