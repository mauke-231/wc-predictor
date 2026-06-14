import { useEffect, useMemo, useState } from 'react';
import { generateSquad, pickLineup } from '../data/squads';
import { getFormation } from '../data/formations';
import { simulateMatch } from '../engine/matchSimulator';
import type { Player, SimulatedMatch, Team } from '../types';
import { getAiMatchCommentary, getAiWinProb } from '../api/ai';

import { FormationPicker } from './FormationPicker';
import { LineupPicker } from './LineupPicker';
import { MatchResult } from './MatchResult';
import { PitchView } from './PitchView';
import { TeamSelector } from './TeamSelector';

interface SimulatorViewProps {
  teams: Team[];
}

export function SimulatorView({ teams }: SimulatorViewProps) {
  const [homeId, setHomeId] = useState(teams[0]?.id ?? '');
  const [awayId, setAwayId] = useState(teams[1]?.id ?? '');
  const [homeFormationId, setHomeFormationId] = useState('4-3-3');
  const [awayFormationId, setAwayFormationId] = useState('4-2-3-1');
  const [homeLineupIds, setHomeLineupIds] = useState<string[]>([]);
  const [awayLineupIds, setAwayLineupIds] = useState<string[]>([]);
  const [result, setResult] = useState<SimulatedMatch | null>(null);
  const [simulating, setSimulating] = useState(false);

  const home = teams.find((t) => t.id === homeId);
  const away = teams.find((t) => t.id === awayId);
  const homeFormation = getFormation(homeFormationId);
  const awayFormation = getFormation(awayFormationId);

  const homeSquad = useMemo(() => (home ? generateSquad(home) : []), [home]);
  const awaySquad = useMemo(() => (away ? generateSquad(away) : []), [away]);

  useEffect(() => {
    if (!home) {
      setHomeLineupIds([]);
      return;
    }
    setHomeLineupIds(pickLineup(generateSquad(home), homeFormation).map((p) => p.id));
  }, [home, homeFormation]);

  useEffect(() => {
    if (!away) {
      setAwayLineupIds([]);
      return;
    }
    setAwayLineupIds(pickLineup(generateSquad(away), awayFormation).map((p) => p.id));
  }, [away, awayFormation]);

  const buildLineup = (squad: Player[], formation: ReturnType<typeof getFormation>, lineupIds: string[]) => {
    const byId = new Map(squad.map((player) => [player.id, player]));
    const selected = new Set<string>();

    return formation.slots.map((slot, index) => {
      const chosen = lineupIds[index] ? byId.get(lineupIds[index]) : undefined;
      if (chosen && chosen.position === slot) {
        selected.add(chosen.id);
        return chosen;
      }

      const fallback = squad.find((player) => player.position === slot && !selected.has(player.id));
      if (fallback) {
        selected.add(fallback.id);
        return fallback;
      }
      return squad[0];
    });
  };

  const homeLineup = useMemo(
    () => (home ? buildLineup(homeSquad, homeFormation, homeLineupIds) : []),
    [home, homeSquad, homeFormation, homeLineupIds],
  );

  const awayLineup = useMemo(
    () => (away ? buildLineup(awaySquad, awayFormation, awayLineupIds) : []),
    [away, awaySquad, awayFormation, awayLineupIds],
  );

  const [probabilities, setProbabilities] = useState<{ homeWin: number; draw: number; awayWin: number } | null>(null);
  const [aiCommentary, setAiCommentary] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!home || !away) {
        setProbabilities(null);
        setAiCommentary(null);
        return;
      }

      try {
        const probs = await getAiWinProb({ home, away });
        if (!cancelled) setProbabilities(probs);
      } catch {
        // keep UI usable; predictions can fall back later
      }

      try {
        const commentary = await getAiMatchCommentary({
          home,
          away,
          homeFormationId,
          awayFormationId,
          prediction: result
            ? { winner: result.winner }
            : undefined,
        });
        if (!cancelled) setAiCommentary(commentary.text);
      } catch {
        // keep UI usable
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [home, away, homeFormationId, awayFormationId, result]);



  const probabilityClass = (value: number) => {
    const rounded = Math.min(100, Math.max(0, Math.round(value / 5) * 5));
    return `p${rounded}`;
  };

  function handleSimulate(knockout = false) {
    if (!home || !away || home.id === away.id) return;
    setSimulating(true);
    setTimeout(() => {
      const match = simulateMatch(home, away, homeFormation, awayFormation, {
        homeLineup,
        awayLineup,
        isKnockout: knockout,
      });
      setResult(match);
      setAiCommentary(null);
      setSimulating(false);


    }, 600);
  }

  function swapTeams() {
    setHomeId(awayId);
    setAwayId(homeId);
    setResult(null);
  }

  return (
    <div>
      <div className="card predictor-hero">
        <h2>Match Simulator</h2>
        <p className="hero-copy">
          Pick any two World Cup teams, set formations, and simulate a full match with lineups, stats, and live events.
        </p>
      </div>

      <div className="simulator-layout">
        <div className="card team-setup">
          <div className="team-setup-header">
            <span className="team-label home">HOME</span>
            {home && (
              <>
                <img src={home.flag} alt="" className="team-flag-lg" />
                <h3>{home.name}</h3>
                <span className="team-rating-badge">OVR {home.rating}</span>
              </>
            )}
          </div>
          <TeamSelector teams={teams} value={homeId} onChange={setHomeId} label="Home Team" excludeId={awayId} />
          <FormationPicker selected={homeFormationId} onChange={setHomeFormationId} />
          {home && (
            <LineupPicker
              squad={homeSquad}
              formation={homeFormation}
              lineupIds={homeLineupIds}
              onLineupChange={setHomeLineupIds}
              onAutoPick={() => setHomeLineupIds(pickLineup(homeSquad, homeFormation).map((p) => p.id))}
              teamLabel="Home"
            />
          )}
        </div>

        <div className="card team-setup">
          <div className="team-setup-header">
            <span className="team-label away">AWAY</span>
            {away && (
              <>
                <img src={away.flag} alt="" className="team-flag-lg" />
                <h3>{away.name}</h3>
                <span className="team-rating-badge">OVR {away.rating}</span>
              </>
            )}
          </div>
          <TeamSelector teams={teams} value={awayId} onChange={setAwayId} label="Away Team" excludeId={homeId} />
          <FormationPicker selected={awayFormationId} onChange={setAwayFormationId} />
          {away && (
            <LineupPicker
              squad={awaySquad}
              formation={awayFormation}
              lineupIds={awayLineupIds}
              onLineupChange={setAwayLineupIds}
              onAutoPick={() => setAwayLineupIds(pickLineup(awaySquad, awayFormation).map((p) => p.id))}
              teamLabel="Away"
            />
          )}
        </div>
      </div>

      {probabilities && home && away && (
        <div className="card card-spaced">
          <h4 className="card-title">Win Probability</h4>
          <div className="win-probabilities">
            <div className={`win-prob-segment home ${probabilityClass(probabilities.homeWin)}`}>
              {probabilities.homeWin}%
            </div>
            <div className={`win-prob-segment draw ${probabilityClass(probabilities.draw)}`}>
              {probabilities.draw}%
            </div>
            <div className={`win-prob-segment away ${probabilityClass(probabilities.awayWin)}`}>
              {probabilities.awayWin}%
            </div>
          </div>
          <div className="probability-axis">
            <span>{home.name}</span>
            <span>Draw</span>
            <span>{away.name}</span>
          </div>
        </div>
      )}

      {home && away && (
        <div className="card card-spaced">
          <h4 className="card-title">Lineups Preview</h4>
          <PitchView
            homeLineup={homeLineup}
            awayLineup={awayLineup}
            homeFormationId={homeFormationId}
            awayFormationId={awayFormationId}
            homeName={home.name}
            awayName={away.name}
          />
        </div>
      )}

      <div className="sim-actions">
        <button type="button" className="btn btn-secondary" onClick={swapTeams}>
          ⇄ Swap Teams
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSimulate(false)}
          disabled={!home || !away || home.id === away.id || simulating}
        >
          {simulating ? 'Simulating...' : '⚽ Simulate Match'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleSimulate(true)}
          disabled={!home || !away || home.id === away.id || simulating}
        >
          🏆 Knockout Mode (ET + Pens)
        </button>
      </div>

      {result && (
        <div className="card">
          <MatchResult match={result} />

          {aiCommentary && (
            <div style={{ marginTop: '1rem' }}>
              <h4 className="card-title">AI Match Analysis</h4>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{aiCommentary}</pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
