# Deploy

Primary path: **Nobus Cloud (Nobus Cube)** for both the **backend** and the **frontend**. **Render** (backend) and **Vercel** (frontend) are fallbacks only if Nobus is blocked. The booth still needs an **offline laptop** copy — venue Wi-Fi can fail.

Order: weights on `main` → David deploys the backend on Nobus and posts the URL in README **Live URLs** → Timi deploys the frontend on Nobus with `VITE_API_URL` set to that origin → David adds the frontend origin to `ALLOWED_ORIGINS` → end-to-end test → offline laptop backup.

No secrets in git. Set keys only in the host’s environment.

David is wiring `/check` and deploying the backend on Nobus now. Timi can build the frontend now against the API contract (mocks until the URL exists) and will deploy it on Nobus too.

## 1. Backend on Nobus Cube (primary)

1. Sign in at [dashboard.nobus.io](https://dashboard.nobus.io) and open **Managed Services → Cubes → New Cube**.
2. Choose **Custom Repository**, repo `https://github.com/drizzy765/adiretrust-app`, branch `main`, enable **Dockerfile Present**, and set **Container Port** to `8000`. The root `Dockerfile` builds from the repository root. It should `COPY model/weights` to `/app/model/weights` and set `MODEL_DIR=/app/model/weights`. Leave **Docker Compose Present** off.
3. Select a small Linux flavor and review the Cost Summary. Once the probe is wired, the image needs CPU PyTorch plus the joblib weights; size the Cube accordingly.
4. Set env vars from `backend/.env.example`: `ALLOWED_ORIGINS` (localhost, then the frontend origin), `MODEL_DIR=/app/model/weights`, `CONFIDENCE_THRESHOLD=0.6`, `DATA_DIR`, plus `GROQ_API_KEY` and `INTRON_API_KEY` only in the Cube environment. Never commit their values.
5. To load reviewed seller/passport records later, mount a directory at `/data` and set `DATA_DIR=/data`. Without records, those routes remain placeholders.
6. When the Cube is active, open port `8000` in its firewall, or map a domain and enable Cube SSL for target port `8000`.
7. Confirm `GET /health` and open `/docs`. Then post the public URL in README **Live URLs** and tell the team **before** the frontend is deployed.
8. After Timi deploys, add the frontend origin to `ALLOWED_ORIGINS` and restart if needed.
9. Shut down the Cube after the demo. Check for any separate volume or IP charges.

## 2. Frontend on Nobus (primary)

Timi can scaffold and develop now, using localhost or mocks until the backend URL exists.

1. Scaffold the Vite + React app in `frontend/` and build to `frontend/dist`.
2. Set `VITE_API_URL` to David’s public Nobus backend origin (no trailing slash).
3. Deploy the static frontend on Nobus Cube.
4. Send the public frontend URL to David for `ALLOWED_ORIGINS`, and add it to README **Live URLs**.
5. Run `npm run build` once and one end-to-end pass against the live API after CORS is updated.

## 3. Fallback: Render (backend) and Vercel (frontend)

Use only if Nobus is blocked (no account, no credits after asking mentors, or the Cube cannot be reached). Still post the public backend URL in README **Live URLs** before frontend deploy.

**Render:** build from the root or `backend/Dockerfile`, set the same env vars as above (`GROQ_API_KEY`, `INTRON_API_KEY`, `GROQ_MODEL`, `INTRON_BASE_URL`, `ALLOWED_ORIGINS`, `DATA_DIR`, `CONFIDENCE_THRESHOLD=0.6`, `MODEL_DIR`). Health check: `GET /health`. Free-tier services may sleep; hit `/health` before a live demo.

**Vercel:** new project, root `frontend`, framework Vite, `VITE_API_URL` pointing at the public backend. Confirm CORS includes the Vercel domain and `http://localhost:5173`.

## 4. Offline laptop (required for the booth)

```bash
# backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # leave keys empty if you do not have them
uvicorn main:app --host 127.0.0.1 --port 8000

# frontend (once scaffolded)
cd frontend
npm install
npm run dev -- --host
```

Or, from the repo root (once the root Dockerfile copies weights): `docker build -t adiretrust-api . && docker run --rm -p 8000:8000 -e MODEL_DIR=/app/model/weights --env-file backend/.env adiretrust-api`.

Have a backup recording of one genuine-looking scan and one print scan if the live photo fails. Say the capture protocol out loud: front, back, close edge.

## What not to deploy yet

- WhatsApp (Twilio sandbox is a later bonus).
- A heatmap, unless a real model produced it.
- Any accuracy claim beyond the `c7350fb` pitch line in the README: “On 27 held-out real photos, 100% correct and never called a factory print genuine.”
