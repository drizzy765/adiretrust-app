# AdireTrust teammate tasks

Work queue for coding agents on `drizzy765/adiretrust-app`. Read this before you write code. Follow the matching skill under `skills/` and `docs/PLAN.md`.

- **David Ajibua** — FastAPI backend and deploy. Wiring `/check` and deploying the backend on Nobus now.
- **Paul Adewole** — preprocessing and Colab training. Run is done (`c7350fb`); commit the weight files next.
- **Timi** (Agoro Oluwatimilehin Teslim) — frontend, and help with training. Start the frontend now; deploy it on Nobus after the backend URL is public.

**Deployment order is mandatory** (see [Deployment order](#deployment-order) below): weights on `main` → **backend on Nobus Cloud** → David shares the public backend URL → **frontend on Nobus** → CORS update → end-to-end test → offline laptop backup. Timi can build now against the [API contract](README.md#api-contract-frontend), using mocks until the URL exists. Do not deploy the frontend to a public host until the Nobus backend URL is in README **Live URLs**. Render/Vercel remain the fallback if Nobus is blocked.

## Global rules

1. **Pull `main` before you start, and pull again immediately before every push.** Images are not in git; use the Drive folder **AdireTrust-data** (https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN).
2. **Push to `main`. Do not open a pull request. Do not force-push.**
3. **No secrets in git.** Never commit `.env`, API keys, Intron/Groq tokens, or screenshots that show them. Use `.env.example` / `backend/.env.example` only. Set real values in the host environment (Nobus, Vercel, local).
4. **No invented metrics, prices, artisan names, or heatmaps.** Use only the `c7350fb` results in the README. If weights are missing, say so and keep stubs labeled `STUB` / `PLACEHOLDER`.
5. **Run the relevant tests once** after your changes, before you push (`pytest` from `backend/` for API work; frontend lint/build once the app is scaffolded).
6. Keep placeholder sellers and stub responses visually labeled until they are real.

---

## Deployment order

Do these in this order. Do not skip ahead.

1. **Weights** — Paul's Colab run (`c7350fb`) is done. Paul still needs to download `dinov2_vits14_logreg.joblib` and `label_map.json` from the Colab file panel (`adiretrust-app/model/weights`) and push them to `model/weights/` on `main`. They are small; committing is fine. Then hand off to David. The root Docker image should copy `model/weights` to `/app/model/weights` and set `MODEL_DIR=/app/model/weights`.
2. **Backend on Nobus** — David is wiring `POST /check` and deploying the API to **Nobus Cloud (Nobus Cube)** now, following `docs/deploy.md`.
3. **Share the URL** — David smoke-tests `GET /health` and `GET /docs` on the public Cube URL, then posts that URL to the team and adds it under README **Live URLs**. This happens **before** any public frontend deploy.
4. **Frontend deploy** — Timi sets `VITE_API_URL` (env var) to David’s Nobus URL and deploys the frontend on **Nobus** too.
5. **CORS update** — David adds the public frontend origin to backend `ALLOWED_ORIGINS` and redeploys or restarts the API if needed.
6. **End-to-end test** — Upload a photo in the live UI, confirm a real verdict or an honest stub, open the seller map and a maps link, open a passport/QR view, send a chat message.
7. **Offline laptop backup** — Required for the booth. Run the API and Vite app locally (or Docker) as in `docs/deploy.md`, in case venue Wi-Fi fails.

**Nobus is the required target for both backend and frontend.** Render (backend) and Vercel (frontend) are a **fallback only if Nobus is blocked**. If you fall back, still post the public backend URL in README **Live URLs** and tell the team *before* frontend deploy. Do not provision Nobus Kubernetes (NKE) or managed Postgres for this demo.

---

## David — FastAPI backend + deploy

Owner of `backend/`. Skills: `skills/backend-api/SKILL.md`, `skills/deploy/SKILL.md`, `skills/intron-voice/SKILL.md`. Chat, voice, and record-backed routes are already on `main` (`f9195b5`). Remaining work: wire the probe into `/check` and deploy on Nobus.

### 1. Pull and confirm starting point

1. `git pull --ff-only origin main`.
2. Confirm whether Paul’s weights exist: `model/weights/dinov2_vits14_logreg.joblib` and `model/weights/label_map.json`. If they are missing, keep `POST /check` an honest stub (or return HTTP 503 once the loader exists) until they land; you can still implement the loader and deploy.
3. Confirm CORS already reads `ALLOWED_ORIGINS` from the environment (`Settings.origins` in `backend/main.py`). Keep that behavior.

### 2. Implement `POST /check` against the probe

When weights are on `main`, load the small joblib probe and extract **frozen DINOv2 ViT-S/14** features from the uploaded image (same 224×224, ImageNet mean/std path as the Colab notebook). Run the logistic regression. **Abstain** (`uncertain`) when the winning class probability is below `CONFIDENCE_THRESHOLD` (default `0.6`; val-chosen threshold was 0.5). Return a **verdict**, **confidence**, **per-class probabilities**, and an **explanation**, plus a real `model_version` (not `"stub"`). Current stub fields are `label`, `confidence`, `reasons`, `price_guidance`, `model_version`, and `filename`.

Rules for the loader:

- **Do not import torch at module import time.** The test `test_importing_app_does_not_load_torch` must still pass. Lazy-load the backbone and probe on first `/check` (or behind a helper).
- If weights are absent, keep the current stub or return HTTP 503 with a clear message. Do not invent a confidence score or a “genuine” call.
- Leave `price_guidance` as `PLACEHOLDER` until a real price source exists.

**Files to touch:** `backend/main.py` (and a new helper module under `backend/` if that keeps imports lazy, e.g. `backend/inference.py`); `backend/requirements.txt`; the root `Dockerfile` so `model/weights/` is copied to `/app/model/weights` and `MODEL_DIR=/app/model/weights`; `backend/tests/test_api.py` (keep the stub tests when no weights are present; add tests for threshold abstain and for “weights missing”; do not require a GPU in CI).

### 3. `GET /sellers` and `GET /passport/{id}` + QR

Already serving records or labeled placeholders. Optional remaining work: QR generation with `qrcode[pil]` (for example `GET /passport/{id}/qr`). Do not invent artisan names.

### 4. Groq chat and Intron voice

Already on `main`. Keep keys server-side. If a key is empty, return the existing `503` (`TEXT_CHAT_UNAVAILABLE` / `VOICE_UNAVAILABLE`), not a fake answer.

### 5. CORS and tests

1. CORS must use `ALLOWED_ORIGINS` (comma-separated). Include `http://localhost:5173` for local Vite. After the frontend is public, add that origin (step 7).
2. From `backend/`: `python -m pip install -r requirements.txt` and run **`pytest` once**. All tests must pass before you push.

### 6. Deploy backend to Nobus (in progress)

1. Push your API work to `main` (pull first).
2. Deploy the backend to **Nobus Cloud / Nobus Cube** from this Git repo, using `docs/deploy.md`: sign in at [dashboard.nobus.io](https://dashboard.nobus.io), **Managed Services → Cubes → New Cube**, open the firewall on port 8000, set env vars (`ALLOWED_ORIGINS`, `MODEL_DIR=/app/model/weights`, `CONFIDENCE_THRESHOLD`, `DATA_DIR`, plus Groq/Intron keys only in the Cube environment). Do not provision NKE or managed Postgres.
3. **Smoke-test** the public URL: `GET /health` returns ok, and `GET /docs` serves the OpenAPI UI.
4. **Then, before anyone deploys the frontend,** post the public backend URL to the team and add it to the README **Live URLs** section. Pull `main`, edit README, push.
5. Use **Render only if Nobus is blocked**. Say so in the README Live URLs note.

### 7. Handoff after the frontend URL exists

When Timi posts the public frontend origin, add it to backend `ALLOWED_ORIGINS` on Nobus, restart if needed, and confirm a browser request from that origin succeeds.

### Done criteria

- [ ] `pytest` in `backend/` passes once on the commit you push.
- [ ] `import main` still does not load torch.
- [ ] `/check` uses the joblib + DINOv2 ViT-S/14 path and abstains at the threshold when weights exist; otherwise it stays an honest stub or returns 503.
- [ ] CORS is driven by `ALLOWED_ORIGINS`.
- [ ] Backend is live on **Nobus Cube** (or Render only if Nobus was blocked).
- [ ] `GET /health` and `GET /docs` succeed on the public URL.
- [ ] That URL is in README **Live URLs** and was sent to the team **before** frontend deploy.

### Handoff

**Receives from Paul:** `model/weights/dinov2_vits14_logreg.joblib` and `model/weights/label_map.json` on `main`.

**Gives to Timi:** the public Nobus backend URL (README Live URLs + a team message). Timi must not ship a public frontend against `localhost`.

---

## Paul — preprocessing + training on Colab

Owner of `model/` and the labels/splits. Skill: `skills/model-training/SKILL.md`. Notebook: `model/train_colab.ipynb`.

The default Colab run is done in commit [`c7350fb`](https://github.com/drizzy765/adiretrust-app/commit/c7350fb): frozen DINOv2 ViT-S/14 plus logistic regression, 204 of 205 images (1 print, `IMG-20261123-WA0087.jpg`, failed to download), train 151 / val 26 / test 27. Test at threshold 0.6: 27 of 27 correct (12 genuine, 15 prints), 0 false-genuine, ROC-AUC 1.00. Val: 25 of 26 decided correctly, 1 abstained as uncertain, 0 errors. Val-chosen threshold 0.5; app default 0.6. Pitch line: “On 27 held-out real photos, 100% correct and never called a factory print genuine.” Caveat: a small set from one workshop.

### Remaining work: push the weights

The trained files are still only in the Colab runtime, not in git (`model/weights/` currently has the README only).

1. `git pull --ff-only origin main`.
2. In the Colab file panel, download `dinov2_vits14_logreg.joblib` and `label_map.json` from `adiretrust-app/model/weights`.
3. Commit both files to `model/weights/` on `main`. They are small; committing is fine. Do not commit `model/runs/` feature caches (gitignored).
4. Tell David the files are on `main` so he can load `MODEL_DIR` and finish wiring `/check`.

**Files to touch:** `model/weights/dinov2_vits14_logreg.joblib`, `model/weights/label_map.json`. Images stay in Drive, not git.

### Done criteria

- [x] Default Colab run completed on a T4 GPU (`c7350fb`).
- [ ] Probe files are on `main` under `model/weights/`.
- [ ] David has been told he can load them.

### Handoff

**Receives from Timi:** print photos are already in Drive `AdireTrust-data/raw/osun_prints/`.

**Gives to David:** the two weight files on `main`.

---

## Timi — frontend + help with training

Owner of `frontend/` and the design system. Skills: `skills/frontend-ui/SKILL.md`, `skills/design-system/SKILL.md`. **Start the frontend now.** Deploy it on Nobus after David posts the backend URL.

### 1. Data (already in Drive)

Training images live in **AdireTrust-data**: https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN. Layout: `raw/osun_genuine` (81), `raw/osun_prints` (100), `raw/synthetic` (24). Do **not** commit images to git.

### 2. Pull and scaffold

1. `git pull --ff-only origin main`.
2. Scaffold **Vite + React** (TypeScript) **in `frontend/`**. Keep `frontend/README.md` product-flow notes.
3. Follow `design/DESIGN_SYSTEM.md` (Adire indigo, type, components, motion).
4. Use `VITE_API_URL` for the API base URL (default `http://localhost:8000`). See the [API contract](README.md#api-contract-frontend).

### 3. Build the product screens (mock the API until the Nobus URL exists)

Implement, against `http://localhost:8000` or fixtures if the API is down:

1. **Upload** — cloth photo dropzone / camera, with the capture protocol (front, back, close edge) in plain language.
2. **Animated scan** — short indigo scan-line / dye-bloom over the photo. Presentation only; never imply the animation is the model.
3. **Result card** — verdict (`Real hand-dyed`, `Factory print`, or `Uncertain`), confidence, written explanation, labeled price guidance. If `/check` is still a stub or no backend URL is set, show that honestly (“Model not loaded — this is a demo shell”). Once wired, `/check` will return a verdict, confidence, per-class probabilities, and an explanation.
4. **Seller map** — Leaflet + OpenStreetMap tiles, browser geolocation, pins from `GET /sellers`, and an **Open in Google Maps** link from `lat`/`lng`. No Google Maps API key.
5. **Passport page** — `GET /passport/{id}`.
6. **Chat panel** — text first, calling `POST /chat`. Do not put Groq or Intron keys in client code. Voice can use the `/voice/*` routes when Intron is configured.

**Files to touch:** everything under `frontend/` (e.g. `package.json`, `src/`, `index.html`, `.env.example` with `VITE_API_URL=http://localhost:8000`); `design/DESIGN_SYSTEM.md` only if a token must be clarified.

### 4. Do not public-deploy until David’s Nobus URL is up

1. Watch README **Live URLs** (and the team channel) for David’s public backend URL.
2. Until then, develop against localhost or mocks. You may help Paul commit the weight files if needed.

### 5. Point the app at Nobus and deploy the frontend

1. Set `VITE_API_URL` to David’s **Nobus** backend URL (no trailing slash).
2. Deploy the frontend on **Nobus Cube** per `docs/deploy.md`. Vercel is the fallback if Nobus is blocked.
3. Send the public frontend URL to David so he can add it to backend `ALLOWED_ORIGINS`, and add the frontend URL to README **Live URLs**.
4. Run one production build (`npm run build`) and one end-to-end pass against the live API after CORS is updated.

### Done criteria

- [ ] Vite + React app lives in `frontend/` and follows the design system.
- [ ] Upload, animated scan, result card, Leaflet/OSM seller map with “Open in Google Maps”, passport page, and chat panel all exist.
- [ ] Stub/placeholder states stay visually honest.
- [ ] No secrets in client code.
- [ ] Public frontend is deployed only after the Nobus backend URL was published.
- [ ] `VITE_API_URL` is that Nobus URL; the frontend origin is in `ALLOWED_ORIGINS`; the frontend URL is in README Live URLs.

### Handoff

**Receives from David:** public Nobus backend URL.

**Gives to David:** public frontend origin for `ALLOWED_ORIGINS`.

---

## Quick status checklist

| Step | Owner | Status |
| --- | --- | --- |
| Prints in Drive `AdireTrust-data/raw/osun_prints/` | Timi | Done — 100 prints are in the Drive folder |
| Colab train (`c7350fb`) | Paul | Done — see README model results |
| Weights on `main` (`model/weights/`) | Paul | Not done — download from Colab and commit `dinov2_vits14_logreg.joblib` and `label_map.json` |
| `/check` wired, tests pass | David | In progress — wiring the model now |
| Backend live on Nobus; URL in README Live URLs | David | In progress — deploying now. **Blocks public frontend deploy** |
| Frontend live on Nobus; CORS updated; e2e pass | Timi + David | Timi can build now with mocks. Deploy after the backend URL is public; David then adds the origin to `ALLOWED_ORIGINS` |
| Offline laptop backup | All | Required for the booth |
