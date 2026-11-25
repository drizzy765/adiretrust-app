# Skill: backend API

Use this when changing the FastAPI service in `backend/`.

## Owner

David Ajibua, with Timi reviewing the contract the frontend needs.

## Do

- Keep `GET /health`, `POST /check`, `GET /sellers`, and `GET /passport/{id}` working.
- `POST /check` accepts an image and returns `{label, confidence, reasons, price_guidance}`.
- Until a real checkpoint exists, return `uncertain` + confidence `0.0` and mark reasons `STUB`. Do not fake a high score.
- Keep keys in environment variables. Never commit `.env`.
- Do not import torch (or Intron/Groq SDKs that fail at import without keys) at module import time. The test suite checks that `import main` does not load torch.
- Proxy Intron and Groq from the server only. The browser must not see those keys.
- After changing the API, run `pytest` from `backend/`.
- CORS must allow the Vite dev origin and the Vercel origin via `ALLOWED_ORIGINS`.

## Don’t

- Don’t invent prices. Leave `price_guidance` as PLACEHOLDER until a real source exists.
- Don’t turn PLACEHOLDER sellers into implied real artisans.
- Don’t add scrapers or write over `data/labels/labels.csv`.
