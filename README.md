# World Cup 2026 Predictor

A web-based predictor and match simulator for the **FIFA World Cup 2026** (USA, Canada, Mexico).

## Features

- **Match Simulator** — Pick any two of the 48 qualified teams, choose formations (4-3-3, 4-4-2, 3-5-2, etc.), preview lineups on a pitch, and simulate full matches with goals, cards, substitutions, stats, and optional knockout mode (extra time + penalties).
- **Tournament Predictor** — Simulates the entire tournament from group stage through the final, including the new 48-team format with 12 groups and Round of 32.
- **Monte Carlo Analysis** — Run 100 tournament simulations to estimate title odds.
- **All Teams** — Browse all 48 nations with FIFA-based strength ratings.

## Data Sources

- **[worldcup26.ir](https://worldcup26.ir)** — Free open-source REST API for teams, groups, matches, and stadiums (no API key required).
- **[openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)** — Fallback fixture data.
- **FIFA Rankings** — Embedded team strength ratings for prediction and simulation.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Custom match simulation engine (Poisson-style goal model, formation-aware lineups)

## How Simulation Works

Team strength is derived from FIFA ranking data (attack, midfield, defense). Squads are procedurally generated with star players for major nations. Formations affect lineup selection. Match events are simulated minute-by-minute including shots, saves, fouls, cards, and goals.
