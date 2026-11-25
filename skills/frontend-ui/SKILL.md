# Skill: frontend UI

Use this when scaffolding or changing the Vite + React app in `frontend/`.

## Owner

Timi.

## Do

- Follow `frontend/README.md` and `design/DESIGN_SYSTEM.md`.
- Build: upload → short scan animation → result card (verdict, confidence, reasons, price guidance).
- Then: Leaflet + OSM seller map, geolocation, “Open in Google Maps” link, no Google key.
- Then: passport view and local-language chat (text first).
- Call the backend with `VITE_API_URL`. If `/check` returns `model_version: stub`, show “Model not loaded” instead of a confident verdict.
- Mark PLACEHOLDER sellers and stub passports in the UI.
- Respect `prefers-reduced-motion`.
- Keep the UI usable on a phone and as a static build for the offline laptop demo.

## Don’t

- Don’t put Intron or Groq keys in Vite env that is inlined into the browser.
- Don’t invent accuracy, prices, or artisan names.
- Don’t use the scan animation as if it were the model.
