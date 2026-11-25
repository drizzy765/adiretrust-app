# AdireTrust app plan

One-day build, starting 25 November 2026, for the Ogun Digital Summit showcase at Ogun Tech Hub, Kobape, Abeokuta (AI/ML track).

## What the app does

A buyer photographs an Adire cloth. The app returns:

- a verdict — **real hand-dyed**, **factory print**, or **uncertain**
- a **confidence** score
- a **full explanation** in plain language (later: Yoruba, Hausa, Igbo, Pidgin)
- **buy/sell price guidance** (only from real sources once they exist; never invent prices)

This is a research/demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. A false “genuine” on a print is the costly error; abstain when unsure.

## Build order

1. **Photo check** — train a frozen DINOv2 ViT-S/14 linear probe when the data allows, and wire `POST /check`. Until then the endpoint is an honest stub (`uncertain`, confidence 0.0, reasons marked STUB).
2. **Interactive frontend** — Vite + React: upload, animated scan, result card. Follow `design/DESIGN_SYSTEM.md`.
3. **Seller map** — Leaflet + OpenStreetMap, browser geolocation, “Open in Google Maps” link. No Google API key. `GET /sellers` currently returns five PLACEHOLDER pins.
4. **QR Adire Passport** — `GET /passport/{id}` plus a printable/scanable card for consented genuine pieces.
5. **Local-language chat** — Groq Llama for text (`GROQ_MODEL=llama-3.3-70b-versatile`). Intron Voice API for speech in `yo` / `ha` / `ig` / `pcm` if credits are available; otherwise text only.
6. **Deploy** — Render (backend, free tier) + Vercel (frontend). Nobus Cube is the optional Nigerian-cloud path (official ODS partner). The booth must also run **offline on a laptop**.
7. **Skills** — `skills/` for teammates and coding agents.

**Later (not required for the first working demo):** WhatsApp via the Twilio sandbox, and a Grad-CAM / attention heatmap on the result card.

## Team

- **David Ajibua** — FastAPI backend (`POST /check`, sellers, passport, later Intron/Groq proxies).
- **Paul Adewole** — preprocessing and model training (DINOv2 probe, splits, eval sheet).
- **Timi (Agoro Oluwatimilehin Teslim)** — frontend, and help with training and evaluation.

Do not list anyone on unrelated projects. Paul and David should be added to this GitHub repo if they will push.

## Data you can use today

Copied from the public research repo `drizzy765/AdireTrust`:

- 81 Osun workshop **genuine** photos (raw + 224px + 512px)
- 24 **synthetic** textures, train-only
- `data/labels/labels.csv` and `splits.csv`

The manifest also lists 100 Osun **print** photos, but those files were not in the public git history. Wikimedia Commons rows were unsplit and were not copied. Do not invent a print set or an accuracy number. If the print folder exists on a teammate’s machine, add it with consent review and say the new count out loud in the pitch.

## Rules

- No secrets in git (`.env`, API keys, Intron/Groq tokens). Use `.env.example` only.
- No invented accuracy, prices, artisan names, or heatmaps.
- Attribute Punch / AFP / Tribune figures correctly if they appear in the pitch (“estimated”, “according to”).
- Keep placeholder sellers and stub responses visually labeled until they are real.
