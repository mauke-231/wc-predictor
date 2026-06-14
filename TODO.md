- [x] Update lineup slot labels (LineupPicker.tsx) to show descriptive roles (LB/CB/RB/LWB/RWB, LMF/AMF/DMF/CMF, etc.) instead of `MID 1`, `DEF 2`, `FWD 1`.
- [ ] Map repeated generic slots (DEF/MID/FWD) within each formation to side/role based on slot index.
- [ ] Keep underlying lineup selection indexing unchanged.
- [ ] Verify build / run and manually confirm dropdown labels render as intended.

- [x] Add Groq-backed prediction endpoint (additional endpoint, keep existing heuristic as fallback).
- [x] Add Groq-backed insights endpoint for match commentary/simulation insights.
- [x] Wire new endpoints into src/api/ai.ts and the UI components.

- [ ] Add .env.example files (completed).

