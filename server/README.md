# wc-predictor AI server (placeholder)

This server provides two AI endpoints used by the UI.

- `POST /api/ai/predict`
- `POST /api/ai/commentary`

Currently both endpoints return placeholder responses based on existing rating/heuristics.

## Run
From repo root:

```bash
npm install
npm run dev
```

The frontend dev server proxies `/api/ai/*` to this server.

## Notes
To integrate a real ML model later:
- Replace the logic in `src/index.ts` for `/api/ai/predict` with model inference.

To integrate a real LLM later:
- Replace `/api/ai/commentary` to call your provider.

