# AdireTrust app plan

One-day build, starting 25 November 2026, for the Ogun Digital Summit showcase at Ogun Tech Hub, Kobape, Abeokuta (AI/ML track).

## What the app does

A buyer photographs an Adire cloth. The app returns:

- a verdict — **real hand-dyed**, **factory print**, or **uncertain**
- a **confidence** score
- a **full explanation** in plain language (later: Yoruba, Hausa, Igbo, Pidgin)
- **buy/sell price guidance** (only from real sources once they exist; never invent prices)

This is a research/demo tool, not a certification standard. A photo alone cannot prove how a cloth was made. A false “genuine” on a print is the costly error; abstain when unsure.


## Training stages (engineering plan)

Follow the official pretraining plan. The default Colab run is still a **frozen DINOv2 ViT-S/14 + logistic regression** probe on the field photos we have. Everything else is optional and gated in `model/train_colab.ipynb`.

Sources: Notion [AdireTrust — Hackathon Prep Plan](https://app.notion.com/p/4199e1028e8581b4a2a6f210c2a32cf8) §8 (Staged Transfer Learning) and §3 (experiments); `docs/research-plan.md` §6–7; `docs/model-methodology.md`. The same text is in the research repo’s `adiretrust.md` / `adiretrust.pdf`. The [ajibua/AdireTrust README](https://github.com/ajibua/AdireTrust) restates the four-stage table.

**Data stages**

1. **General backbone** — frozen pretrained DINOv2 or SigLIP (ViT-S / ViT-B). Not trained from scratch.
2. **Intermediate related task** — batik tulis/cap vs print, plus DTD, AITEX, optionally Wax-MNIST / TILDA. Do not auto-download these in the default notebook run.
3. **Scraped + synthetic** — labeled web images and procedural textures. **Synthetic is train only; evaluate on real photos only.**
4. **Field photos** — Abeokuta genuine vs print, ideally front + back + macro, 30–50 pieces per class minimum (prefer ~300). This is the demo domain.

**Experiment order**

1. Zero-shot CLIP / SigLIP prompts, optional VLM on a fixed 20-piece preview (explanation layer only).
2. Linear probe **or** k-NN on frozen DINOv2 and SigLIP (and a frozen EfficientNet). Try global embeddings and patch tokens. First real score. Compare on **val**.
3. Fine-tune **only the winner**, last blocks first (~1e-5, early stopping), and only if the probe is useful and n is large enough. Do not full-network fine-tune on fewer than 300 pieces. Later options: EfficientNet-B0 / MobileNetV2, or ConvNeXt / small ViT if the transformer wins.
4. Ablations if time: front vs front+back; full vs macro; one phone vs mixed.

Train-only augmentation (lighting, blur, small rotation, color jitter, macro crops) belongs with fine-tuning. Split by physical `piece_id`. Headline metric: **precision on genuine**. Also report recall and precision on both classes, false-genuine count, confusion matrix, ROC-AUC when both classes exist, and a val-tuned abstain threshold (app default 0.6 is a starting point). Grad-CAM or DINOv2 patch-similarity maps are inspection aids, not proof. **Do not invent metrics.**

## Build order

1. **Photo check** — default: train a frozen DINOv2 ViT-S/14 logistic-regression probe in Colab (`model/train_colab.ipynb`) when the data allows, and wire `POST /check`. Optional gated cells cover k-NN, SigLIP, EfficientNet-B0, ViT-B / patch tokens, zero-shot prompts, and heatmaps. Until a real checkpoint is wired, the endpoint is an honest stub (`uncertain`, confidence 0.0, reasons marked STUB).
2. **Interactive frontend** — Vite + React: upload, animated scan, result card. Follow `design/DESIGN_SYSTEM.md`.
3. **Seller map** — Leaflet + OpenStreetMap, browser geolocation, “Open in Google Maps” link. No Google API key. `GET /sellers` currently returns five PLACEHOLDER pins.
4. **QR Adire Passport** — `GET /passport/{id}` plus a printable/scanable card for consented genuine pieces.
5. **Local-language chat** — Groq for text (`GROQ_MODEL=openai/gpt-oss-120b`, configurable). Intron Voice API for speech in `yo` / `ha` / `ig` / `pcm` if credits are available; otherwise text only.
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
