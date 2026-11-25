# AdireTrust

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb)

Phone-camera app that helps a buyer check whether a cloth looks like **hand-dyed Abeokuta adire** or a **factory print**. It returns a verdict, a confidence score, a written explanation, and (later) buy/sell price guidance and a QR Adire Passport.

This is a research and demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. Model results are limited to the small, single-workshop evaluation described below and in [`model/EVAL.md`](model/EVAL.md).

Built for the [Ogun Digital Summit Hackathon](https://www.ogundigitalsummit.com/hackathon) (showcase 25 November 2026, Ogun Tech Hub, Kobape, Abeokuta; AI/ML track).

Teammate work is in [`TASKS.md`](TASKS.md) (steps, files, done-criteria, handoffs, and deploy order).

## Team

- **Timi** (Agoro Oluwatimilehin Teslim) — frontend, and help with training. Building the frontend now and deploying it on Nobus.
- **David Ajibua** — FastAPI backend. Wired the model into `/check`; preparing the backend for Nobus deployment.
- **Paul Adewole** — preprocessing and model training.

## Model results

From Paul's Colab run in commit [`c7350fb`](https://github.com/drizzy765/adiretrust-app/commit/c7350fb): frozen **DINOv2 ViT-S/14** plus logistic regression.

- **204 of 205** images loaded (1 print, `IMG-20261123-WA0087.jpg`, failed to download).
- Split: **train 151**, **val 26**, **test 27**.
- **Test** at threshold 0.6: **27 of 27 correct** (12 genuine, 15 prints), **0 false-genuine**, **ROC-AUC 1.00**.
- **Val:** 25 of 26 decided correctly, 1 abstained as uncertain, 0 errors.
- Val-chosen threshold **0.5**; app default **0.6**.

Pitch line: “On 27 held-out real photos, 100% correct and never called a factory print genuine.” Caveat: a small set from one workshop. Do not claim a general accuracy.

## Weights

The trained probe and `label_map.json` are in [`model/weights/`](model/weights/). The root Docker image copies them to `/app/model/weights` and sets `MODEL_DIR=/app/model/weights`.

`POST /check` runs the probe when the artifacts load successfully; it returns HTTP 503 if they are missing or the model cannot load.

## What works today

- FastAPI backend: `GET /health`, `/capabilities`, `/check`, `/sellers`, `/passport/{id}`, `/chat`, and Intron voice routes. `/check` uses the committed probe and returns 503 if model artifacts are missing or cannot load. Provider keys remain server-side.
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
frontend/     Vite + React (scaffold now; see frontend/README.md)
model/        DINOv2 ViT-S/14 linear probe; commit weights to model/weights/
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

Train or re-run the DINOv2 probe in Colab: [Open in Colab](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) (`model/train_colab.ipynb`).

## API contract (frontend)

Timi can start the frontend now. Talk to the API at `VITE_API_URL` (default `http://localhost:8000`). Use mocks until David posts the public Nobus backend URL in **Live URLs**.

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

## Live URLs

Not deployed yet. **David posts the public Nobus backend URL here after `GET /health` and `GET /docs` pass, and tells the team, before the frontend is deployed.** Timi then deploys the frontend on Nobus and David adds that origin to `ALLOWED_ORIGINS`. Render/Vercel are only a fallback if Nobus is blocked.

- Backend (Nobus Cube): _pending_
- Frontend (Nobus): _pending_

## Deploy

Deploy **backend and frontend to Nobus Cloud**. Order: weights pushed → backend deployed → URL shared in **Live URLs** → frontend deployed (`VITE_API_URL`) → CORS updated → end-to-end test → offline laptop backup. Render/Vercel remain the fallback. How-to: [`docs/deploy.md`](docs/deploy.md). Full order: [`TASKS.md`](TASKS.md).

## Rules

- No secrets in git
- No invented accuracy, prices, or artisan names
- Use only the `c7350fb` results and pitch line above; do not claim a general accuracy
- Placeholder data stays labeled PLACEHOLDER
