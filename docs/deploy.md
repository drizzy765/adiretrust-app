# Deploy

Primary path for this one-day build: **Render (backend, free tier)** and **Vercel (frontend)**. **Nobus Cube** is an optional Nigerian-cloud deploy (Nobus is the official Ogun Digital Summit hackathon partner). The booth still needs an **offline laptop** copy — venue Wi-Fi can fail.

No secrets in git. Set keys only in the host’s environment.

## 1. Backend on Render (primary)

1. Build from `backend/Dockerfile` (Python 3.11, `uvicorn` on `$PORT`).
2. Create a Render Web Service from this repo, root directory `backend`, or the Dockerfile path `backend/Dockerfile`.
3. Set env vars from `backend/.env.example`: `GROQ_API_KEY`, `INTRON_API_KEY`, `GROQ_MODEL`, `INTRON_BASE_URL`, `ALLOWED_ORIGINS` (your Vercel origin), `DATA_DIR`, `CONFIDENCE_THRESHOLD=0.6`.
4. Health check: `GET /health`.
5. Free-tier services may sleep; hit `/health` before a live demo, or keep a local process running for the booth.

Render is enough for the stub API and, later, a small CPU probe. A large vision backbone may be tight on free instances — if inference is slow or OOM, run the model on the laptop and keep Render as the public URL backup.

## 2. Frontend on Vercel

1. Scaffold the Vite + React app in `frontend/` and build to `frontend/dist`.
2. New Vercel project, root `frontend`, framework Vite.
3. Set `VITE_API_URL` to the Render origin (no trailing-slash surprises).
4. Confirm CORS: Render `ALLOWED_ORIGINS` must include the Vercel domain and `http://localhost:5173`.

## 3. Nobus Cube (optional)

Use this if a Nobus account is available. Check the Cube Cost Summary before launching.

1. Sign in at [dashboard.nobus.io](https://dashboard.nobus.io) and open **Managed Services → Cubes → New Cube**.
2. Choose **Custom Repository**, repo `https://github.com/drizzy765/adiretrust-app`, branch `main`, enable **Dockerfile Present**, and set **Container Port** to `8000`. The root `Dockerfile` builds from the repository root. Leave **Docker Compose Present** off.
3. Select a small Linux flavor for the current API stub and review the Cost Summary. `/check` does not load a model or PyTorch.
4. Set `ALLOWED_ORIGINS` to the frontend origin when it exists. Set `GROQ_API_KEY` for chat and `INTRON_API_KEY` for voice. These are optional; never commit their values.
5. To load reviewed seller/passport records later, mount a directory at `/data` and set `DATA_DIR=/data`. Without records, those routes remain placeholders.
6. When the Cube is active, open port `8000` in its firewall, or map a domain and enable Cube SSL for target port `8000`.
7. Confirm `GET /health` and open `/docs`. The photo check remains a stub until a validated checkpoint and inference code are supplied.
8. Shut down the Cube after the demo. Check for any separate volume or IP charges.

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

Or: `docker build -t adiretrust-api ./backend && docker run --rm -p 8000:8000 --env-file backend/.env adiretrust-api`.

Have a backup recording of one genuine-looking scan and one print scan if the live photo fails. Say the capture protocol out loud: front, back, close edge.

## What not to deploy yet

- WhatsApp (Twilio sandbox is a later bonus).
- A heatmap, unless a real model produced it.
- Any invented accuracy on a slide or a landing page.
