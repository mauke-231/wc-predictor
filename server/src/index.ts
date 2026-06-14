import express from 'express';
import cors from 'cors';
import { getGroqClient } from './groq';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

type WinProb = { homeWin: number; draw: number; awayWin: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Placeholder "AI" prediction: uses the same heuristic as the frontend.
function quickPredictFromRatings(homeRating: number, awayRating: number): WinProb {
  const diff = homeRating - awayRating;
  const homeAdv = 3;
  const adjusted = diff + homeAdv;
  const homeWin = Math.round(clamp(33 + adjusted * 2.2, 10, 85));
  const awayWin = Math.round(clamp(33 - adjusted * 2.2, 10, 85));
  const draw = 100 - homeWin - awayWin;
  return {
    homeWin,
    draw: Math.max(5, draw),
    awayWin,
  };
}

function formatTopReasons(args: {
  homeName: string;
  awayName: string;
  homeRating: number;
  awayRating: number;
  formationNote?: string;
}) {
  const { homeName, awayName, homeRating, awayRating, formationNote } = args;
  const diff = homeRating - awayRating;
  const favorite = diff >= 0 ? homeName : awayName;
  const underdog = diff >= 0 ? awayName : homeName;

  const ratingReason =
    Math.abs(diff) >= 12
      ? 'The rating gap is large, which strongly impacts win probabilities in this model.'
      : Math.abs(diff) >= 5
        ? 'The rating edge suggests a moderate advantage in match control.'
        : 'The teams are relatively close in strength, so outcomes are more coin-flippy.';

  const formationReason =
    formationNote ??
    'Formations influence lineup strength selection, affecting chance creation and defensive solidity in the simulator.';

  return [
    `Favorite: ${favorite} (vs ${underdog}) based on team strength.`,
    ratingReason,
    formationReason,
  ];
}

// Existing heuristic prediction.
app.post('/api/ai/predict', (req, res) => {
  const { homeRating, awayRating } = req.body as {
    homeRating: number;
    awayRating: number;
  };

  if (typeof homeRating !== 'number' || typeof awayRating !== 'number') {
    return res.status(400).json({ error: 'homeRating and awayRating must be numbers' });
  }

  const probs = quickPredictFromRatings(homeRating, awayRating);
  return res.json(probs);
});

function buildPredictionPrompt(args: {
  homeName: string;
  awayName: string;
  homeRating: number;
  awayRating: number;
  homeFormationId: string;
  awayFormationId: string;
}): string {
  const { homeName, awayName, homeRating, awayRating, homeFormationId, awayFormationId } = args;

  return [
    'You are a football analyst for World Cup matches.',
    'Using ONLY the provided information, estimate win probabilities for a single match.',
    'Return probabilities for home win, draw, and away win that sum to 100.',
    '',
    `Match: ${homeName} vs ${awayName}`,
    `Ratings (FIFA style): ${homeName}=${homeRating}, ${awayName}=${awayRating}`,
    `Formations: ${homeFormationId} (home) vs ${awayFormationId} (away)`,
    '',
    'Output format (exactly, valid JSON with integer values):',
    '{"homeWin": <0-100>, "draw": <0-100>, "awayWin": <0-100>}',
  ].join('\n');
}

function tryParseGroqProbJSON(text: string): WinProb | null {
  try {
    const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : text;
    const obj = JSON.parse(raw) as Partial<WinProb>;
    if (
      typeof obj.homeWin !== 'number' ||
      typeof obj.draw !== 'number' ||
      typeof obj.awayWin !== 'number'
    ) {
      return null;
    }

    const homeWin = clamp(Math.round(obj.homeWin), 0, 100);
    const draw = clamp(Math.round(obj.draw), 0, 100);
    const awayWin = clamp(Math.round(obj.awayWin), 0, 100);

    // Normalize to sum to 100 to be safe.
    const sum = homeWin + draw + awayWin;
    if (sum === 0) return null;

    const scale = 100 / sum;
    const h = Math.round(homeWin * scale);
    const d = Math.round(draw * scale);
    const a = 100 - h - d;

    return {
      homeWin: clamp(h, 0, 100),
      draw: clamp(d, 0, 100),
      awayWin: clamp(a, 0, 100),
    };
  } catch {
    return null;
  }
}

// Groq-backed prediction (additional endpoint; keeps existing heuristic as fallback).
app.post('/api/ai/predict_groq', async (req, res) => {
  const {
    homeName,
    awayName,
    homeRating,
    awayRating,
    homeFormationId,
    awayFormationId,
  } = req.body as {
    homeName: string;
    awayName: string;
    homeRating: number;
    awayRating: number;
    homeFormationId?: string;
    awayFormationId?: string;
  };

  if (
    typeof homeName !== 'string' ||
    typeof awayName !== 'string' ||
    typeof homeRating !== 'number' ||
    typeof awayRating !== 'number'
  ) {
    return res.status(400).json({ error: 'homeName, awayName, homeRating, awayRating must be provided' });
  }

  const fallback = quickPredictFromRatings(homeRating, awayRating);

  try {
    const groq = getGroqClient();
    const prompt = buildPredictionPrompt({
      homeName,
      awayName,
      homeRating,
      awayRating,
      homeFormationId: homeFormationId ?? '4-3-3',
      awayFormationId: awayFormationId ?? '4-2-3-1',
    });

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) return res.json(fallback);

    const parsed = tryParseGroqProbJSON(text);
    return res.json(parsed ?? fallback);
  } catch {
    return res.json(fallback);
  }
});


function buildCommentaryPrompt(args: {
  homeName: string;
  awayName: string;
  homeRating: number;
  awayRating: number;
  homeFormationId: string;
  awayFormationId: string;
  winner?: string;
  reasons: string[];
}): string {
  const { homeName, awayName, homeRating, awayRating, homeFormationId, awayFormationId, winner, reasons } = args;
  const winnerLine = winner ? `Predicted winner: ${winner}` : 'No explicit winner provided.';

  return [
    `You are an expert football commentator.`,
    `Create a concise match-analysis commentary for a World Cup match using ONLY the information provided.`,
    `Do NOT mention that you are an API or that you used Groq.`,
    `Write in plain English.`,
    ``,
    `Match: ${homeName} vs ${awayName}`,
    `Ratings: ${homeName}=${homeRating}, ${awayName}=${awayRating}`,
    `Formations: ${homeFormationId} (home) vs ${awayFormationId} (away)`,
    ``,
    winnerLine,
    ``,
    `Key reasons (must be reflected in the commentary):`,
    ...reasons.map((r) => `- ${r}`),
    ``,
    `Output format (exactly):`,
    `1) One-sentence summary of the matchup`,
    `2) Three bullet points explaining the key tactical/strength reasons`,
    `3) One closing sentence predicting how the match may unfold`,
  ].join('\n');
}

// Existing AI commentary via Groq (commentary only; win prob stays heuristic).
app.post('/api/ai/commentary', async (req, res) => {
  const body = req.body as {
    matchContext?: {
      homeName: string;
      awayName: string;
      homeRating: number;
      awayRating: number;
      homeFormationId?: string;
      awayFormationId?: string;
    };
    prediction?: any;
  };

  const ctx = body.matchContext;
  const prediction = body.prediction;

  if (!ctx) {
    return res.status(400).json({ error: 'matchContext is required' });
  }

  try {
    const formationNote =
      ctx.homeFormationId && ctx.awayFormationId
        ? `Using ${ctx.homeFormationId} vs ${ctx.awayFormationId}, the simulator shifts chances based on lineup selection.`
        : undefined;

    const reasons = formatTopReasons({
      homeName: ctx.homeName,
      awayName: ctx.awayName,
      homeRating: ctx.homeRating,
      awayRating: ctx.awayRating,
      formationNote,
    });

    const prompt = buildCommentaryPrompt({
      homeName: ctx.homeName,
      awayName: ctx.awayName,
      homeRating: ctx.homeRating,
      awayRating: ctx.awayRating,
      homeFormationId: ctx.homeFormationId ?? '4-3-3',
      awayFormationId: ctx.awayFormationId ?? '4-2-3-1',
      winner: prediction?.winner,
      reasons,
    });

    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: 'Groq returned empty content' });

    return res.json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'AI commentary failed' });
  }
});

function buildInsightsPrompt(args: {
  homeName: string;
  awayName: string;
  homeRating: number;
  awayRating: number;
  homeFormationId: string;
  awayFormationId: string;
  winner?: string;
  scoreHint?: string;
}): string {
  const {
    homeName,
    awayName,
    homeRating,
    awayRating,
    homeFormationId,
    awayFormationId,
    winner,
    scoreHint,
  } = args;

  const winnerLine = winner ? `Winner reference (if available): ${winner}.` : 'Winner reference: not provided.';

  return [
    'You are a football tactical analyst creating match insights.',
    'Use ONLY the provided information.',
    'Provide a short sectioned answer with the following headings and brief paragraphs:',
    '',
    'Home strengths',
    'Away strengths',
    'Tactical matchup to watch',
    'How the match might swing',
    '',
    `Match: ${homeName} vs ${awayName}`,
    `Ratings: ${homeName}=${homeRating}, ${awayName}=${awayRating}`,
    `Formations: ${homeFormationId} (home) vs ${awayFormationId} (away)`,
    winnerLine,
    scoreHint ? `Score hint: ${scoreHint}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// Groq-backed insights (additional endpoint; fallback to heuristic reasons).
app.post('/api/ai/insights_groq', async (req, res) => {
  const body = req.body as {
    matchContext?: {
      homeName: string;
      awayName: string;
      homeRating: number;
      awayRating: number;
      homeFormationId?: string;
      awayFormationId?: string;
    };
    prediction?: {
      winner?: string;
    };
    scoreHint?: string;
  };

  const ctx = body.matchContext;
  const winner = body.prediction?.winner;
  const scoreHint = body.scoreHint;

  if (!ctx) {
    return res.status(400).json({ error: 'matchContext is required' });
  }

  const formationNote =
    ctx.homeFormationId && ctx.awayFormationId
      ? `Using ${ctx.homeFormationId} vs ${ctx.awayFormationId}, the simulator shifts chances based on lineup selection.`
      : undefined;

  const fallbackReasons = formatTopReasons({
    homeName: ctx.homeName,
    awayName: ctx.awayName,
    homeRating: ctx.homeRating,
    awayRating: ctx.awayRating,
    formationNote,
  });

  try {
    const groq = getGroqClient();
    const prompt = buildInsightsPrompt({
      homeName: ctx.homeName,
      awayName: ctx.awayName,
      homeRating: ctx.homeRating,
      awayRating: ctx.awayRating,
      homeFormationId: ctx.homeFormationId ?? '4-3-3',
      awayFormationId: ctx.awayFormationId ?? '4-2-3-1',
      winner,
      scoreHint,
    });

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 250,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return res.json({ text: fallbackReasons.join('\n') });
    }

    return res.json({ text });
  } catch {
    return res.json({ text: fallbackReasons.join('\n') });
  }
});


const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AI server listening on http://localhost:${port}`);
});

