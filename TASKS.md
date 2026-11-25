# AdireTrust teammate tasks

Work queue for coding agents on `drizzy765/adiretrust-app`. Read this before you write code. Follow the matching skill under `skills/` and `docs/PLAN.md`.

- **David Ajibua** — FastAPI backend and deploy
- **Paul Adewole** — preprocessing and Colab training
- **Timi** (Agoro Oluwatimilehin Teslim) — frontend, and help with training

**Deployment order is mandatory** (see [Deployment order](#deployment-order) below): trained weights → **backend on Nobus Cloud** → David shares the public backend URL → frontend deploy → CORS update → end-to-end test → offline laptop backup. Do not deploy the frontend to a public host until the Nobus backend URL is in README **Live URLs**.

## Global rules

1. **Pull `main` before you start, and pull again immediately before every push.** Timi may still be uploading `data/raw/osun_prints/` via the GitHub web UI.
2. **Push to `main`. Do not open a pull request. Do not force-push.**
3. **No secrets in git.** Never commit `.env`, API keys, Intron/Groq tokens, or screenshots that show them. Use `.env.example` / `backend/.env.example` only. Set real values in the host environment (Nobus, Vercel, local).
4. **No invented metrics, prices, artisan names, or heatmaps.** If print photos or weights are missing, say so and keep stubs labeled `STUB` / `PLACEHOLDER`.
5. **Run the relevant tests once** after your changes, before you push (`pytest` from `backend/` for API work; frontend lint/build once the app is scaffolded).
6. Keep placeholder sellers and stub responses visually labeled until they are real.

---

## Deployment order

Do these in this order. Do not skip ahead.

1. **Weights** — Paul trains in Colab, writes `model/EVAL.md` with computed numbers, and pushes `model/weights/dinov2_vits14_logreg.joblib` plus `model/weights/label_map.json` to `main`. Paul then hands off to David.
2. **Backend on Nobus** — David wires `POST /check` (and the other API work below), deploys the API to **Nobus Cloud (Nobus Cube)** from this Git repo / `backend/Dockerfile`, following the Cube steps in `docs/deploy.md` §3.
3. **Share the URL** — David smoke-tests `GET /health` and `GET /docs` on the public Cube URL, then posts that URL to the team and adds it under README **Live URLs**. This happens **before** any public frontend deploy.
4. **Frontend deploy** — Timi sets `VITE_API_URL` to David’s Nobus URL and deploys the frontend (Nobus Cube or Vercel, see `docs/deploy.md`).
5. **CORS update** — David (or Timi, if David hands over the Cube env) adds the public frontend origin to backend `ALLOWED_ORIGINS` and redeploys or restarts the API if needed.
6. **End-to-end test** — Upload a photo in the live UI, confirm a real verdict or an honest stub, open the seller map and a maps link, open a passport/QR view, send a chat message.
7. **Offline laptop backup** — Required for the booth. Run the API and Vite app locally (or Docker) as in `docs/deploy.md` §4, in case venue Wi-Fi fails.

**Nobus is the required backend target.** Render is a **fallback only if Nobus is blocked** (no account, no credits after asking mentors, or the Cube cannot be reached). If you fall back to Render, still post the public backend URL in README **Live URLs** and tell the team *before* frontend deploy. Do not provision Nobus Kubernetes (NKE) or managed Postgres for this demo.

---

## David — FastAPI backend + deploy

Owner of `backend/`. Skills: `skills/backend-api/SKILL.md`, `skills/deploy/SKILL.md`, `skills/intron-voice/SKILL.md`.

### 1. Pull and confirm starting point

1. `git pull --ff-only origin main`.
2. Confirm whether Paul’s weights exist: `model/weights/dinov2_vits14_logreg.joblib` and `model/weights/label_map.json`. If they are missing, keep `POST /check` an honest stub until they land; you can still implement the loader and the other endpoints.
3. Confirm CORS already reads `ALLOWED_ORIGINS` from the environment (`Settings.origins` in `backend/main.py`). Keep that behavior.

### 2. Implement `POST /check` against the probe

When weights are on `main`, load the small joblib probe and extract **frozen DINOv2 ViT-S/14** features from the uploaded image (same 224×224, ImageNet mean/std path as the Colab notebook). Run the logistic regression. **Abstain** (`uncertain`) when the winning class probability is below `CONFIDENCE_THRESHOLD` (default `0.6`, or the chosen threshold in `label_map.json` if you read it). Return `label`, `confidence`, `reasons`, `price_guidance`, and a real `model_version` (not `"stub"`).

Rules for the loader:

- **Do not import torch at module import time.** The test `test_importing_app_does_not_load_torch` must still pass. Lazy-load the backbone and probe on first `/check` (or behind a helper).
- If weights are absent, keep the current stub: `uncertain`, confidence `0.0`, reasons marked `STUB`.
- Do not invent a confidence score or a “genuine” call.
- Leave `price_guidance` as `PLACEHOLDER` until a real price source exists.

**Files to touch:** `backend/main.py` (and a new helper module under `backend/` if that keeps imports lazy, e.g. `backend/inference.py`); `backend/requirements.txt` (`joblib`; add `torch` / `timm` only when inference is actually wired); `backend/Dockerfile` so the **repo-root** `model/weights/` files are in the image (the current Docker context is `backend/` only — fix the context or `COPY` the weight files); `backend/tests/test_api.py` (keep the stub tests when no weights are present; add tests for threshold abstain and for “weights missing → stub”; do not require a GPU in CI).

### 3. `GET /sellers` and `GET /passport/{id}` + QR

1. Keep `GET /sellers` working. The five pins may stay `PLACEHOLDER` fixtures, clearly labeled. Each pin should already include `lat`, `lng`, and a Google Maps URL.
2. Keep `GET /passport/{id}` honest if no consented passport record exists (`PLACEHOLDER`).
3. Add QR generation with the `qrcode` library (add `qrcode[pil]` to `backend/requirements.txt`). For example `GET /passport/{id}/qr` returning a PNG, or a QR image field on the passport payload, pointing at the public passport URL. Do not invent artisan names.

**Files to touch:** `backend/main.py`, `backend/requirements.txt`, `backend/tests/test_api.py`.

### 4. Groq chat endpoint and optional Intron proxy

1. Add a server-side chat endpoint (e.g. `POST /chat`) that calls Groq with `GROQ_MODEL` (default `llama-3.3-70b-versatile`). The Groq key stays on the server. If `GROQ_API_KEY` is empty, return a clear “chat unavailable” response, not a fake answer.
2. Optional: Intron Voice API proxy for STT/TTS in `yo` / `ha` / `ig` / `pcm` when `INTRON_API_KEY` is set (`INTRON_BASE_URL` default `https://infer.voice.intron.io`). If credits or the key are missing, disable voice cleanly. Never send these keys to the browser.

**Files to touch:** `backend/main.py`, `backend/.env.example` (only new variable *names*, no secrets), `backend/tests/test_api.py`, `skills/intron-voice/SKILL.md` if the contract changes.

### 5. CORS and tests

1. CORS must use `ALLOWED_ORIGINS` (comma-separated). Include `http://localhost:5173` for local Vite. After the frontend is public, add that origin (step 7).
2. From `backend/`: `python -m pip install -r requirements.txt` and run **`pytest` once**. All tests must pass before you push.

### 6. RULE — deploy backend to Nobus before frontend

1. Push your API work to `main` (pull first).
2. Deploy the backend to **Nobus Cloud / Nobus Cube** from this Git repo or `backend/Dockerfile`, using `docs/deploy.md` §3: sign in at [dashboard.nobus.io](https://dashboard.nobus.io), **Managed Services → Cubes → New Cube**, open the firewall on the app port (8000 or 80; ports are closed by default), set env vars from `backend/.env.example` (`ALLOWED_ORIGINS`, `CONFIDENCE_THRESHOLD`, `DATA_DIR`, plus Groq/Intron keys only in the Cube environment). Do not provision NKE or managed Postgres.
3. **Smoke-test** the public URL: `GET /health` returns ok, and `GET /docs` serves the OpenAPI UI.
4. **Then, before anyone deploys the frontend,** post the public backend URL to the team and add it to the README **Live URLs** section. Pull `main`, edit README, push.
5. Use **Render only if Nobus is blocked**. Say so in the README Live URLs note.

**Files to touch:** Cube env (not git); `README.md` (Live URLs); `docs/deploy.md` only if a real Cube quirk must be recorded.

### 7. Handoff after the frontend URL exists

When Timi posts the public frontend origin, add it to backend `ALLOWED_ORIGINS` on Nobus, restart if needed, and confirm a browser request from that origin succeeds.

### Done criteria

- [ ] `pytest` in `backend/` passes once on the commit you push.
- [ ] `import main` still does not load torch.
- [ ] `/check` uses the joblib + DINOv2 ViT-S/14 path and abstains at the threshold when weights exist; otherwise it stays an honest stub.
- [ ] `/sellers` and `/passport/{id}` work; passport QR is generated with `qrcode`.
- [ ] Groq `/chat` is server-side; Intron proxy is optional and key-safe.
- [ ] CORS is driven by `ALLOWED_ORIGINS`.
- [ ] Backend is live on **Nobus Cube** (or Render only if Nobus was blocked).
- [ ] `GET /health` and `GET /docs` succeed on the public URL.
- [ ] That URL is in README **Live URLs** and was sent to the team **before** frontend deploy.

### Handoff

**Receives from Paul:** `model/weights/*.joblib`, `label_map.json`, and `model/EVAL.md` on `main`.

**Gives to Timi:** the public Nobus backend URL (README Live URLs + a team message). Timi must not ship a public frontend against `localhost`.

---

## Paul — preprocessing + training on Colab

Owner of `model/` and the labels/splits. Skill: `skills/model-training/SKILL.md`. Notebook: `model/train_colab.ipynb`.

### 1. Pull and check the print photos

1. `git pull --ff-only origin main`.
2. Check `data/raw/osun_prints/` (Timi is uploading the 100 Osun print photos there). Also check `data/raw/osun_genuine/` and `data/raw/synthetic/`.
3. If prints are still missing, use the notebook’s Drive fallback (`PRINTS_DRIVE_DIR` or `DATA_DRIVE_ROOT` in section 3). Do not invent a print set.

### 2. Run the default Colab path

1. Open [model/train_colab.ipynb](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) with a **GPU** runtime.
2. Run the default cells only first: frozen **DINOv2 ViT-S/14** + **logistic regression**. Leave optional `RUN_*` flags `False` unless you have time after the default export.
3. Confirm the notebook’s Dataset/loader prints counts per class and split, and lists missing files.

### 3. Write real evaluation and export weights

1. Let the notebook write `model/EVAL.md` from **computed** metrics (precision/recall on both classes, false-genuine count, ROC-AUC only if both classes exist, val threshold sweep, then apply the chosen threshold and `0.6` to test).
2. Export `model/weights/dinov2_vits14_logreg.joblib` and `model/weights/label_map.json`. Do not commit `model/runs/` feature caches (gitignored).
3. If a two-class fit was impossible, say that in `EVAL.md`. Do not paste a batik-paper number as an AdireTrust result.

### 4. Push and hand off

1. `git pull --ff-only origin main`, then add the two weight files and `model/EVAL.md`, commit, and **push to `main`** (no PR).
2. Tell David the files are on `main` so he can wire `/check` and deploy Nobus.

**Files to touch:** `model/train_colab.ipynb` only if a real bug blocks training; `model/EVAL.md` (generated); `model/weights/dinov2_vits14_logreg.joblib`; `model/weights/label_map.json`. Optional later: `data/raw/osun_prints/` if you are the one adding consented local files.

### Done criteria

- [ ] Default Colab run completed on a GPU.
- [ ] `EVAL.md` contains metrics from that run (or a clear “both classes not present” status). No invented accuracy.
- [ ] Probe files are on `main` under `model/weights/`.
- [ ] David has been told he can load them.

### Handoff

**Receives from Timi:** print photos in `data/raw/osun_prints/` or a Drive path.

**Gives to David:** weights + `EVAL.md` on `main`.

**May ask Timi** to help review val errors and the threshold choice.

---

## Timi — frontend + help with training

Owner of `frontend/` and the design system. Skills: `skills/frontend-ui/SKILL.md`, `skills/design-system/SKILL.md`. Help Paul with training/eval when needed.

### 1. Pull and scaffold

1. `git pull --ff-only origin main`.
2. Scaffold **Vite + React** (TypeScript) **in `frontend/`** (`npm create vite@latest . -- --template react-ts` or equivalent). Keep `frontend/README.md` product-flow notes.
3. Follow `design/DESIGN_SYSTEM.md` (Adire indigo, type, components, motion).

### 2. Build the product screens (mock the API until the Nobus URL exists)

Implement, against `http://localhost:8000` or fixtures if the API is down:

1. **Upload** — cloth photo dropzone / camera, with the capture protocol (front, back, close edge) in plain language.
2. **Animated scan** — short indigo scan-line / dye-bloom over the photo. Presentation only; never imply the animation is the model.
3. **Result card** — verdict (`Real hand-dyed`, `Factory print`, or `Uncertain`), confidence, written reasons, labeled price guidance. If `/check` is still a stub or no backend URL is set, show that honestly (“Model not loaded — this is a demo shell”).
4. **Seller map** — Leaflet + OpenStreetMap tiles, browser geolocation, pins from `GET /sellers`, and an **Open in Google Maps** link from `lat`/`lng`. No Google Maps API key.
5. **Passport page** — `GET /passport/{id}` plus the QR (image from the API or generated from the public passport URL).
6. **Chat panel** — text first, calling David’s Groq endpoint. Do not put Groq or Intron keys in client code. Voice can wait until an Intron proxy exists.

**Files to touch:** everything under `frontend/` (e.g. `package.json`, `src/`, `index.html`, `.env.example` with `VITE_API_URL=http://localhost:8000`); `design/DESIGN_SYSTEM.md` only if a token must be clarified.

### 3. Do not public-deploy until David’s Nobus URL is up

1. Watch README **Live URLs** (and the team channel) for David’s public backend URL.
2. Until then, develop against localhost or mocks. You may help Paul with Colab / `EVAL.md` review in parallel.

### 4. Point the app at Nobus and deploy the frontend

1. Set `VITE_API_URL` to David’s **Nobus** backend URL (no trailing-slash surprises).
2. Deploy the frontend per `docs/deploy.md`: **Nobus Cube** (static or same Cube if that is simpler) **or Vercel** (`frontend/` as the Vite root).
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

**Gives to Paul:** `data/raw/osun_prints/` (or a Drive path) as soon as the print photos are in place; help on training/eval if asked.

**Receives from David:** public Nobus backend URL.

**Gives to David:** public frontend origin for `ALLOWED_ORIGINS`.

---

## Quick status checklist

| Step | Owner | Status |
| --- | --- | --- |
| Prints in `data/raw/osun_prints/` | Timi | In progress / check `main` after pull |
| Colab train + `EVAL.md` + weights on `main` | Paul | Not done until files exist |
| `/check` wired, tests pass | David | Not done until weights are loaded or honest stub remains |
| Backend live on Nobus; URL in README Live URLs | David | **Blocks public frontend deploy** |
| Frontend live; CORS updated; e2e pass | Timi + David | After the Nobus URL is public |
| Offline laptop backup | All | Required for the booth |
