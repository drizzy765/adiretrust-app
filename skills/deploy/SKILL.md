# Skill: deploy

Use this when shipping the API or the frontend, or when preparing the booth laptop.

## Source of truth

`docs/deploy.md`.

## Do

- Primary: backend on **Render** (free tier, `backend/Dockerfile`, `PORT`), frontend on **Vercel**.
- Optional: **Nobus Cube** (official ODS cloud partner) if credits or an account are actually available. No free tier is advertised. Shut the Cube down after the demo.
- Required: offline laptop path (`uvicorn` + Vite, or Docker) for Ogun Tech Hub.
- Set env vars from `.env.example` in the host. Never commit values.
- Confirm `GET /health` and CORS against the real frontend origin.

## Don’t

- Don’t provision Nobus Kubernetes or managed Postgres for this demo.
- Don’t assume venue Wi-Fi will work.
- Don’t print secrets in logs, README commands, or screenshots.
