# AdireTrust

Phone-camera app that helps a buyer check whether a cloth looks like **hand-dyed Abeokuta adire** or a **factory print**. It returns a verdict, a confidence score, a written explanation, and (later) buy/sell price guidance and a QR Adire Passport.

This is a research and demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. There is **no trained model in this repository yet**, and there is **no reported AdireTrust accuracy**. `POST /check` is an honest stub until a probe is trained and wired.

Built for the [Ogun Digital Summit Hackathon](https://www.ogundigitalsummit.com/hackathon) (showcase 25 November 2026, Ogun Tech Hub, Kobape, Abeokuta; AI/ML track).

## Team

- **Timi** (Agoro Oluwatimilehin Teslim) — frontend, and help with training
- **David Ajibua** — FastAPI backend
- **Paul Adewole** — preprocessing and model training

## What works today

- FastAPI skeleton: `GET /health`, `POST /check` (stub), `GET /sellers` (five PLACEHOLDER pins), `GET /passport/{id}` (stub)
- Dataset slice copied from [`drizzy765/AdireTrust`](https://github.com/drizzy765/AdireTrust): 81 Osun genuine photos, 24 train-only synthetics, labels and splits
- Plan, design system, deploy notes, and agent skills

The 100 Osun print photos listed in the manifest were **not** in the public source git history. Do not invent a print set or a score.

## Repo layout

```
backend/     FastAPI app, Dockerfile, tests
frontend/     Vite + React (scaffold next; see frontend/README.md)
model/        DINOv2 ViT-S/14 linear probe skeleton
data/         labeled images and manifests
docs/         PLAN.md, deploy.md, consent and methodology
design/       DESIGN_SYSTEM.md
skills/       teammate / coding-agent skills
```

## Quick start (API)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
pytest
uvicorn main:app --reload --port 8000
```

`GET http://localhost:8000/health` should return `{"status":"ok"}`.

Frontend scaffolding and the DINOv2 probe come next. See `docs/PLAN.md`.

## Deploy

Render (backend, free tier) + Vercel (frontend) is the primary path. Nobus Cube is optional. The booth also needs an offline laptop copy. Details: `docs/deploy.md`.

## Rules

- No secrets in git
- No invented accuracy, prices, or artisan names
- Placeholder data stays labeled PLACEHOLDER
