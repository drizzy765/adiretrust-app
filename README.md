# AdireTrust

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb)

Phone-camera app that helps a buyer check whether a cloth looks like **hand-dyed Abeokuta adire** or a **factory print**. It returns a verdict, a confidence score, a written explanation, price guidance, and a QR Adire Passport.

This is a research and demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. Model results are limited to the small, single-workshop evaluation described below and in [`model/EVAL.md`](model/EVAL.md).

Built for the [Ogun Digital Summit Hackathon](https://www.ogundigitalsummit.com/hackathon) (showcase 25 November 2026, Ogun Tech Hub, Kobape, Abeokuta; AI/ML track). Team **spyders**.

Teammate work is in [`TASKS.md`](TASKS.md) (steps, files, done-criteria, handoffs, and deploy order).

## Live URLs

- **Frontend:** http://102.209.47.246 (Nobus, deploying)
- **Backend API:** http://102.209.47.246:8000 (Nobus, live; `GET /health` ok)

Serve the frontend over HTTP. The backend is plain HTTP, and a HTTPS frontend would be blocked by mixed content. Set `ALLOWED_ORIGINS=*` (or the frontend origin) on the backend so the browser can call the API.

## Team

- **Agoro Oluwatimilehin** — frontend, AI/ML
- **David Ajibua** — backend, deploy
- **Paul Adewole** — data collection, model training

## Features

- **Photo verdict.** `POST /check` returns `genuine_hand_dyed`, `factory_print`, or `uncertain`, with confidence, a written explanation, reasons, and price guidance.
- **Sellers map.** `GET /sellers` plotted with Leaflet and OpenStreetMap tiles, plus an “Open in Google Maps” link.
- **QR Adire Passport.** Result cards link to `/passport/:id`, served by `GET /passport/{id}`.
- **Chat.** `POST /chat` in `en` / `yo` / `ha` / `ig` / `pcm` via Groq.
- **Voice.** Intron speech-to-text and text-to-speech when those capabilities are available.

## Model

Frozen **DINOv2 ViT-S/14** plus a logistic regression probe. Full numbers and matrices are in [`model/EVAL.md`](model/EVAL.md) (from Paul's Colab run in commit [`c7350fb`](https://github.com/drizzy765/adiretrust-app/commit/c7350fb)).

- **Data:** 81 genuine photos collected by teammate Paul Adewole at a workshop in Ibadan, 100 factory prints, and 24 synthetic images (train-only). 204 of 205 images loaded (1 print, `IMG-20261123-WA0087.jpg`, failed to download).
- **Split:** train 151 / val 26 / test 27.
- **Test** (threshold 0.6): **27/27** correct (12 genuine, 15 prints), **0 prints called genuine**, **AUC 1.00**.
- **Val:** 25/26 decided correctly, 1 abstained as uncertain, 0 errors.
- Val-chosen threshold **0.5**; app default **0.6**.

Pitch line: “On 27 held-out real photos, 100% correct and never called a factory print genuine.”

**Caveats:** this is a small dataset from one workshop. Do not claim a general accuracy. Current `piece_id` values are provisional (one image = one id), so the split is effectively by image, not by cloth piece.

## Weights

The trained probe and `label_map.json` are in [`model/weights/`](model/weights/). The root Docker image copies them to `/app/model/weights` and sets `MODEL_DIR=/app/model/weights`.

`POST /check` runs the probe when the artifacts load successfully; it returns HTTP 503 if they are missing or the model cannot load.

## What works today

- FastAPI backend: `GET /health`, `/capabilities`, `/check`, `/sellers`, `/passport/{id}`, `/chat`, and Intron voice routes. `/check` uses the committed probe and returns 503 if model artifacts are missing or cannot load. Provider keys remain server-side.
- Frontend: Vite + React Check, Sellers, Passport, and Chat pages (see [`frontend/README.md`](frontend/README.md)). Without `VITE_API_URL` at build or dev time, the frontend runs in mock mode.
- Sellers and passports can load reviewed JSON records from `DATA_DIR`; absent records still produce clearly labeled placeholders.
- Labels and splits in `data/labels/`. Photos are in [AdireTrust-data on Google Drive](https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN): 81 genuine, 100 prints in `raw/osun_prints/`, and 24 train-only synthetics. The Colab notebook downloads each file by Drive id (see `data/README.md` and `model/train_colab.ipynb`).
- Plan, design system, deploy notes, and agent skills.

Training **images are not in git**. They live in **AdireTrust-data** — [open the folder](https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN) (Anyone with the link, Viewer). Layout: `raw/osun_genuine`, `raw/osun_prints`, `raw/synthetic`.

A full-history clone still contains old image blobs. Prefer a shallow clone:

```bash
git clone --depth 1 https://github.com/drizzy765/adiretrust-app.git
```

## Repo layout

```
backend/     FastAPI app, Dockerfile, tests
frontend/     Vite + React (Check, Sellers, Passport, Chat)
model/        DINOv2 ViT-S/14 linear probe; commit weights to model/weights/
data/         labels/splits in git; images are in Drive (see data/README.md)
docs/         PLAN.md, deploy.md, consent and methodology
design/       DESIGN_SYSTEM.md
skills/       teammate / coding-agent skills
TASKS.md      teammate steps, handoffs, and deploy order
```

## Run locally

Env vars for the backend (see `.env.example` or `backend/.env.example`): `GROQ_API_KEY`, `INTRON_API_KEY`, `ALLOWED_ORIGINS`, `MODEL_DIR`. Chat and voice need the provider keys; photo check needs the committed weights in `MODEL_DIR`.

```bash
# Backend
pip install -r backend/requirements.txt
cd backend && uvicorn main:app --port 8000
```

`GET http://localhost:8000/health` should return `{"status":"ok"}`.

Optional local setup with a venv and tests:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
pytest
uvicorn main:app --reload --port 8000
```

```bash
# Frontend
cd frontend
npm ci
VITE_API_URL=http://localhost:8000 npm run dev
```

Without `VITE_API_URL`, the frontend runs in mock mode.

Train or re-run the DINOv2 probe in Colab: [Open in Colab](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) (`model/train_colab.ipynb`).

## API contract (frontend)

Talk to the live API at http://102.209.47.246:8000, or set `VITE_API_URL` (default for local work: `http://localhost:8000`). Without `VITE_API_URL`, the frontend uses mocks.

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| `GET` | `/health` | none | `{ "status": "ok" }` |
| `GET` | `/capabilities` | none | `{ "photo_check": { "available", "model_version" }, "text_chat": { "available" }, "voice_input": { "available" }, "voice_output": { "available" } }` |
| `POST` | `/check` | multipart field `image` (file, max 10 MB) | `{ "label", "verdict", "confidence", "class_probabilities", "explanation", "reasons", "price_guidance", "model_version", "filename" }`. Label/verdict is `genuine_hand_dyed`, `factory_print`, or `uncertain`. Returns 503 if model artifacts are missing or unavailable. |
| `GET` | `/sellers` | none | `{ "sellers": [ { "id", "name", "market", "city", "lat", "lng", "maps_url", "placeholder", "note" } ], "note" }` |
| `GET` | `/passport/{item_id}` | path `item_id` (`[A-Za-z0-9_-]{1,100}`) | `{ "id", "status", "note", "artisan_name", "workshop", "market", "date", "photo_urls", "maps_url" }` |
| `POST` | `/chat` | JSON `{ "messages": [{ "role": "user" \| "assistant", "content" }], "language": "en" \| "yo" \| "ha" \| "ig" \| "pcm" }`. 1–12 messages, last must be `user`. | `{ "reply", "language", "model" }`. `503` with `TEXT_CHAT_UNAVAILABLE` if Groq is not configured. |
| `POST` | `/voice/transcribe` | multipart: file `audio` (WAV, MP3, MP4, M4A, OGG, WebM, or FLAC, max 20 MB) and form field `language` (`en` \| `yo` \| `ha` \| `ig` \| `pcm`) | `{ "transcript", "language", "status" }`, or `202` `{ "file_id", "status": "processing", "language" }` |
| `GET` | `/voice/transcriptions/{file_id}` | path `file_id` (`[A-Za-z0-9-]{1,100}`) | `{ "file_id", "status", "transcript" }` |
| `POST` | `/voice/speech` | JSON `{ "text", "voice_language", "voice_accent", "voice_gender": "male" \| "female", "output_audio_format": "wav" \| "opus" }` | `{ "audio_url", "audio_duration_in_seconds", "status" }`, or `202` `{ "text_id", "status": "processing" }` |
| `GET` | `/voice/speech/{text_id}` | path `text_id` (`[A-Za-z0-9-]{1,100}`) | `{ "text_id", "status", "audio_url", "audio_duration_in_seconds" }` |

Voice routes return `503` with `VOICE_UNAVAILABLE` if Intron is not configured; keep using text chat. Groq and Intron keys stay on the server. CORS is `ALLOWED_ORIGINS` (comma-separated exact origins).

## Deploy on Nobus

Deploy **backend and frontend to Nobus Cloud**. How-to: [`docs/deploy.md`](docs/deploy.md). Full order: [`TASKS.md`](TASKS.md). Pass `GROQ_API_KEY` and `INTRON_API_KEY` to the backend container if you want chat and voice. Open inbound TCP 80 and 8000 in the Nobus firewall.

```bash
# Backend (from the repo root)
docker build -t adire .
docker run -d -p 8000:8000 -e ALLOWED_ORIGINS=* adire

# Frontend (VITE_API_URL is baked in at build time)
docker build --build-arg VITE_API_URL=http://102.209.47.246:8000 -t adire-web frontend
docker run -d -p 80:80 adire-web
```

Without `VITE_API_URL` at build time, the frontend image runs in mock mode.

## Rules

- No secrets in git
- No invented accuracy, prices, or artisan names
- Use only the `c7350fb` results and pitch line above; do not claim a general accuracy
- Placeholder data stays labeled PLACEHOLDER
