import type { Team } from '../types';

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export type WinProb = { homeWin: number; draw: number; awayWin: number };

export async function getAiWinProb(params: {
  home: Team;
  away: Team;
}): Promise<WinProb> {
  return postJson<WinProb>('/api/ai/predict', {
    homeRating: params.home.rating,
    awayRating: params.away.rating,
  });
}

export async function getAiMatchCommentary(params: {
  home: Team;
  away: Team;
  homeFormationId: string;
  awayFormationId: string;
  prediction?: { winner: string };
}): Promise<{ text: string }> {
  return postJson<{ text: string }>('/api/ai/commentary', {
    matchContext: {
      homeName: params.home.name,
      awayName: params.away.name,
      homeRating: params.home.rating,
      awayRating: params.away.rating,
      homeFormationId: params.homeFormationId,
      awayFormationId: params.awayFormationId,
    },
    prediction: params.prediction,
  });
}

