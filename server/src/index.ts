import express from 'express';
import cors from 'cors';

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

// Placeholder "LLM" commentary: template-based analysis grounded in what we have.
app.post('/api/ai/commentary', (req, res) => {
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

  const text = [
    `Match read: ${ctx.homeName} vs ${ctx.awayName}.`,
    `Why it favors the prediction:`,
    `- ${reasons[0]}`,
    `- ${reasons[1]}`,
    `- ${reasons[2]}`,
    prediction?.winner ? `Predicted winner: ${prediction.winner}` : '',
    `\n(Starter AI note: placeholder. Swap in a real LLM later without changing the UI.)`,
  ]
    .filter(Boolean)
    .join('\n');

  return res.json({ text });
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AI server listening on http://localhost:${port}`);
});

