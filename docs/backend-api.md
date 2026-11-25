# Backend API

The FastAPI service is in `backend/main.py`. The root `Dockerfile` builds it for deployments that build from the repository root. The API listens on `PORT` (default `8000`).

## Endpoints

| Route | Purpose |
| --- | --- |
| `GET /health` | Liveness check |
| `GET /capabilities` | Reports which optional providers and model are configured |
| `POST /check` | Accepts multipart field `image`; currently returns the explicitly labeled model stub |
| `GET /sellers` | Returns verified records from `DATA_DIR/sellers.json`, or labeled placeholder fixtures when that file is absent |
| `GET /passport/{id}` | Returns `DATA_DIR/passports/{id}.json`, or a labeled placeholder when absent |
| `POST /chat` | Groq text chat; expects `{ "language": "en|yo|ha|ig|pcm", "messages": [{"role":"user|assistant","content":"..."}] }` |
| `POST /voice/transcribe` | Multipart fields `audio` and `language`; returns a transcript or a processing ID |
| `GET /voice/transcriptions/{file_id}` | Checks a pending Intron transcription |
| `POST /voice/speech` | Accepts `{ "text", "voice_language", "voice_accent", "voice_gender", "output_audio_format" }`; returns an audio URL or processing ID |
| `GET /voice/speech/{text_id}` | Checks a pending Intron speech request |

Groq and Intron credentials are read only by the backend from `GROQ_API_KEY` and `INTRON_API_KEY`. If the Groq key is absent, `/chat` returns `503 TEXT_CHAT_UNAVAILABLE`. If the Intron key is absent, voice routes return `503 VOICE_UNAVAILABLE`; clients should continue with text chat.

## Optional record files

Set `DATA_DIR` to a mounted directory when loading reviewed records. Without these files, sellers and passports remain clearly marked placeholders.

`sellers.json` may be an array or an object containing a `sellers` array. Each item uses the API `Seller` fields: `id`, `name`, `market`, `city`, `lat`, `lng`, `maps_url`, and `note`. Keep `placeholder: true` unless the listing is verified and approved for publication.

Passport records live at `passports/{id}.json` and use the `PassportResponse` fields: `status`, `note`, plus optional artisan, workshop, market, date, photo URL, and map URL fields. Only add records backed by consented information. Do not place private contact details in these files.

## Deployment settings

Configure `ALLOWED_ORIGINS` with comma-separated exact browser origins, including the deployed frontend when it exists. `GROQ_MODEL`, `INTRON_BASE_URL`, `DATA_DIR`, and `CONFIDENCE_THRESHOLD` can also be set as environment variables. Do not commit secret values. The current photo check remains a stub until an evaluated checkpoint and inference implementation are supplied.
