import { useEffect, useState } from 'react';
import { fetchGroups, fetchTeams } from './api/worldcup';
import { PredictorView } from './components/PredictorView';
import { SimulatorView } from './components/SimulatorView';
import { TeamsView } from './components/TeamsView';
import type { Team } from './types';
import './styles/components.css';

type Tab = 'predictor' | 'simulator' | 'teams';

export default function App() {
  const [tab, setTab] = useState<Tab>('simulator');
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [teamData, groupData] = await Promise.all([fetchTeams(), fetchGroups()]);
        setTeams(teamData);
        setGroups(groupData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load World Cup data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <span className="header-badge">FIFA World Cup 2026</span>
        <h1>World Cup Predictor</h1>
        <p>USA · Canada · Mexico — Predict, simulate, and explore all 48 nations</p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'simulator' ? 'active' : ''}`}
          onClick={() => setTab('simulator')}
        >
          ⚽ Match Simulator
        </button>
        <button
          type="button"
          className={`tab ${tab === 'predictor' ? 'active' : ''}`}
          onClick={() => setTab('predictor')}
        >
          🏆 Tournament Predictor
        </button>
        <button
          type="button"
          className={`tab ${tab === 'teams' ? 'active' : ''}`}
          onClick={() => setTab('teams')}
        >
          🌍 All Teams
        </button>
      </nav>

      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          <p>Loading World Cup 2026 teams from API...</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && teams.length > 0 && (
        <>
          {tab === 'simulator' && <SimulatorView teams={teams} />}
          {tab === 'predictor' && <PredictorView teams={teams} groups={groups} />}
          {tab === 'teams' && <TeamsView teams={teams} />}
        </>
      )}
    </div>
  );
}
