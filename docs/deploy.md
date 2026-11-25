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

Use this if hackathon credits or a Nobus account are actually available. Nobus does **not** advertise a general free tier; confirm credits with mentors before spinning resources up. Billing starts when a compute/Cube instance is `running` and compute charges stop when it is shut down (volumes and IPs may still bill).

1. Sign in at [dashboard.nobus.io](https://dashboard.nobus.io). Docs: [nobus.io/documentation](https://nobus.io/documentation). Availability zones include `Nobus-wa-az1` and `Nobus-wa-az2`.
2. **Managed Services → Cubes → New Cube.** Deploy from this Git repo or the backend Docker image. Prefer a single container that serves the API and, if useful, the built frontend.
3. Small flavor is enough for the stub API (about 2 vCPU / 2–4 GiB). Watch the Cost Summary before confirming.
4. When the Cube is Active, **Open Firewall** on the app port (8000 or 80). Ports are closed by default.
5. Set the same env vars as Render. Optional: map a domain and **Enable SSL**.
6. Optional later: Nobus FOS for uploaded images. Do **not** provision Kubernetes (NKE) or managed Postgres for the demo — SQLite or local files are enough.
7. Shut the Cube down after the booth to stop compute charges.

Public advertised pricing (do not invent a monthly flavor total): FCS listed “as low as ₦9,309/month”; FOS ₦60/GB-month and ₦2 per 1,000 requests. See [nobus.io/pricing](https://www.nobus.io/pricing).

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
