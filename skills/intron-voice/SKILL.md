# Skill: Intron voice

Use this when adding Yoruba, Hausa, Igbo, or Pidgin speech to the chat.

## What Intron is

[Intron Voice API](https://docs.voice.intron.io) (Sahara ASR + TTS) is the local-language **speech** layer. It is not the cloth classifier and not the LLM. Groq Llama drafts or translates text; Intron speaks and listens.

## Do

- Keys: `INTRON_API_KEY`, `INTRON_BASE_URL=https://infer.voice.intron.io`. Read them only in FastAPI. `Authorization: Bearer <key>`.
- Languages: `yo`, `ha`, `ig`, `pcm` (ASR is code-switched with English). TTS needs `voice_language`, `voice_accent`, and `voice_gender`.
- Preferred demo STT: `POST /file/v1/upload/sync` (max 120s, 30 req/min) or the official web widget if it can be used without exposing the key.
- Preferred demo TTS: `POST /tts/v1/generate` (≤4096 characters, 30 req/min).
- Check credits with `GET /accounts/v1/balance` (NGN for Nigerian accounts). There is no public per-minute tariff. If the key or balance is missing, **fall back to text**.
- Keep a visible transcript on screen so the booth still works without audio.

## Don’t

- Don’t send the API key to the browser.
- Don’t block the whole chat feature on Intron being configured.
- Don’t claim a free-credit amount that you have not seen in the Intron portal.
