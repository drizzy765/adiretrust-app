# AdireTrust frontend

Vite + React + TypeScript UI. `VITE_API_URL` is the API origin with no trailing slash. Leave it empty to use local mocks. Never put Groq or Intron keys in a `VITE_*` variable.

```bash
cd frontend
npm install
npm run dev
```

Nobus builds the frontend from the repository root using `docker-compose.yml` (set `VITE_API_URL` to the backend origin in the Cube's build variables). For a local build, run `docker build -t adiretrust-web ./frontend --build-arg VITE_API_URL=https://your-api.example`.

## Product flow

1. **Upload** — a cloth photo (front, ideally also the reverse and a close edge). Show the capture protocol in plain language, Yoruba-friendly copy later.
2. **Animated scan** — a short indigo scan-line / dye-bloom animation over the photo. This is presentation, not analysis. Never imply the animation is the model.
3. **Result card** — verdict (`Real hand-dyed`, `Factory print`, or `Uncertain`), confidence, written reasons, and clearly labeled price guidance. If the API is still a stub, show that honestly (“Model not loaded — this is a demo shell”).
4. **Seller map** — Leaflet + OpenStreetMap tiles, browser geolocation, and an “Open in Google Maps” link built from lat/lng. No Google Maps API key. Pins come from `GET /sellers` (currently PLACEHOLDER fixtures).
5. **QR Adire Passport** — scan or open `GET /passport/{id}` for a consented piece (artisan/workshop, market, date, photos). Stubbed until records exist.
6. **Local-language chat** — text first, via Groq Llama (`llama-3.3-70b-versatile`). Optional voice in Yoruba, Hausa, Igbo, and Pidgin through the Intron Voice API when credits are available.

## Stack to scaffold

- Vite, React, TypeScript
- Follow `design/DESIGN_SYSTEM.md` (Adire indigo palette, type, components, motion)
- Talk to the FastAPI backend (`VITE_API_URL`, default `http://localhost:8000`)
- Leaflet + `react-leaflet` (or vanilla Leaflet) and OSM tiles
- Deploy the built static app to Vercel; keep a copy that also works from the FastAPI origin for the offline laptop demo

## Rules

- No secrets in the frontend repo or in client-side code. Intron and Groq keys stay on the backend.
- Do not invent accuracy, prices, or artisan names.
- Placeholder sellers and stub verdicts must remain visually labeled as placeholders until real data is wired.
- Skills: `skills/frontend-ui/SKILL.md` and `skills/design-system/SKILL.md`.
