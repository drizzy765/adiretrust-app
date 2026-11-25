# Agent guide — AdireTrust app

This is the product repo for AdireTrust (`drizzy765/adiretrust-app`). The research dataset and ingestion scripts live in [drizzy765/AdireTrust](https://github.com/drizzy765/AdireTrust). Work here unless you are fixing source labels.

## Team

- **David** — FastAPI backend
- **Paul** — preprocessing and model training
- **Timi** — frontend, and help with training

## Before you change anything

1. Read `docs/PLAN.md` and the skill that matches your task under `skills/`.
2. Do not invent accuracy, prices, artisan names, or heatmaps.
3. Do not commit `.env`, API keys, weights that you did not train here, or scraped images that are not in the consented labeled set.
4. The current `POST /check` is a **stub**. Keep that honest in the UI until a real checkpoint is wired.

## Repo map

- `backend/` — FastAPI (`GET /health`, `POST /check`, `GET /sellers`, `GET /passport/{id}`)
- `frontend/` — Vite + React app (scaffold still to be created)
- `model/` — DINOv2 ViT-S/14 linear probe skeleton
- `data/` — labeled Osun genuine photos, synthetics (train only), manifests
- `design/DESIGN_SYSTEM.md` — indigo palette, type, components, motion
- `docs/deploy.md` — Render + Vercel primary, Nobus Cube optional, offline laptop required

## Local checks

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

Do not install torch in the API environment. `train_probe.py --dry-run` must work without torch.

## Git

Push to feature branches if several people are writing at once; do not force-push `main`. Never open a PR just to land a first scaffold if the team has agreed to push `main` for this one-day build — but do not rewrite published history.

## Voice and language

Intron Voice API is the speech layer (Yoruba, Hausa, Igbo, Pidgin). Groq Llama is for text. Keys stay on the server. If credits are missing, fall back to text.
