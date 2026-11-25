# AdireTrust

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb)


Phone-camera app that helps a buyer check whether a cloth looks like **hand-dyed Abeokuta adire** or a **factory print**. It returns a verdict, a confidence score, a written explanation, and (later) buy/sell price guidance and a QR Adire Passport.

This is a research and demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. There is **no trained model in this repository yet**, and there is **no reported AdireTrust accuracy**. `POST /check` is an honest stub until a probe is trained and wired.

Built for the [Ogun Digital Summit Hackathon](https://www.ogundigitalsummit.com/hackathon) (showcase 25 November 2026, Ogun Tech Hub, Kobape, Abeokuta; AI/ML track).

Teammate work is in [`TASKS.md`](TASKS.md) (steps, files, done-criteria, handoffs, and deploy order).

## Team

- **Timi** (Agoro Oluwatimilehin Teslim) — frontend, and help with training
- **David Ajibua** — FastAPI backend
- **Paul Adewole** — preprocessing and model training

## What works today

- FastAPI skeleton: `GET /health`, `POST /check` (stub), `GET /sellers` (five PLACEHOLDER pins), `GET /passport/{id}` (stub)
- Labels and splits in `data/labels/` (copied from [`drizzy765/AdireTrust`](https://github.com/drizzy765/AdireTrust)). Photos are in [AdireTrust-data on Google Drive](https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN): 81 genuine, 24 train-only synthetics; prints to be added in `raw/osun_prints/`.
- Plan, design system, deploy notes, and agent skills

Training **images are not in git** (they made clones large). They live in the Google Drive folder **AdireTrust-data** — [open the folder](https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN) (Anyone with the link, Viewer). Layout: `raw/osun_genuine`, `raw/osun_prints`, `raw/synthetic`. Colab downloads this folder with `gdown` by default; see `data/README.md` and `model/train_colab.ipynb`.

The manifest still lists 100 Osun print photos; add those files to `raw/osun_prints/` in Drive when you have them. Do not invent a print set or a score.

A full-history clone still contains old image blobs. Prefer a shallow clone:

```bash
git clone --depth 1 https://github.com/drizzy765/adiretrust-app.git
```

## Repo layout

```
backend/     FastAPI app, Dockerfile, tests
frontend/     Vite + React (scaffold next; see frontend/README.md)
model/        DINOv2 ViT-S/14 linear probe skeleton
data/         labels/splits in git; images are in Drive (see data/README.md)
docs/         PLAN.md, deploy.md, consent and methodology
design/       DESIGN_SYSTEM.md
skills/       teammate / coding-agent skills
TASKS.md      teammate steps, handoffs, and deploy order
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

Frontend scaffolding comes next. Train the DINOv2 probe in Colab: [Open in Colab](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) (`model/train_colab.ipynb`). See `docs/PLAN.md`.

## Live URLs

Not deployed yet. **David posts the public Nobus backend URL here after `GET /health` and `GET /docs` pass, and tells the team, before the frontend is deployed.** Render is only a fallback if Nobus is blocked.

- Backend (Nobus Cube): _pending_
- Frontend: _pending_

## Deploy

Deploy **backend to Nobus Cube first**, share the URL in **Live URLs**, then deploy the frontend (Nobus or Vercel) and update `ALLOWED_ORIGINS`. Render is a fallback only if Nobus is blocked. The booth also needs an offline laptop copy. Order: [`TASKS.md`](TASKS.md). How-to: `docs/deploy.md`.

## Rules

- No secrets in git
- No invented accuracy, prices, or artisan names
- Placeholder data stays labeled PLACEHOLDER
