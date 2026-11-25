# AdireTrust frontend design brief

Locked visual direction for the mobile-first Vite + React UI. Tokens come from [`design/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). Product patterns come from official marketing screenshots and brand sites opened for this brief. Refero and Mobbin connectors were unavailable (both returned paid-plan errors), so no Refero style IDs or Mobbin links are cited.

These reference images are third-party marketing screenshots and brand-site captures, used only as design references. They are not training data, not consented workshop photos, and must not be shipped as product assets or implied to be AdireTrust screens.

## Reference lock

- **Primary foundation:** `design/DESIGN_SYSTEM.md`. Preserve the indigo-ink / resist-white canvas, Fraunces + Figtree + IBM Plex Mono pairing, 16px cards / 999px pills / 4px official marks, and the rule that uncertainty has the same visual weight as a decisive verdict.
- **Landing / media:** [ARA Lagos](https://aralagos.com/en-us) hero — full-bleed photograph of people wearing indigo-and-white Adire, then a short serif brand line on cream. Cloth imagery should feel like real dyed fabric (see also Studio 189 batik / indigo product photos), not stock Ankara or illustrated patterns behind text.
- **Borrow only:** scan framing from PictureThis; ranked-score result stack from PlantNet; map + bottom sheet from Airbnb; QR-pass layout from Google Wallet; hold-to-talk from WhatsApp.
- **Reject:** generic fintech dashboards; government-seal “certified authentic” marks; copying CovPass / EU health-certificate chrome; red-alarm typography for factory print; looping the scan after a result; invented prices, accuracy, or artisan names; decorative serif word-swaps in body copy.

## Palette

Use the design-system tokens. Do not invent new brand colors.

| Token | Hex | Role |
| --- | --- | --- |
| `indigo-ink` | `#0B1F4A` | Headings on light, passport marks, optional dark bands |
| `indigo-dye` | `#1C3F8A` | Primary actions, scan line, links, confidence fill |
| `indigo-mid` | `#3A5FB0` | Hover, focus rings, default map pins |
| `indigo-mist` | `#D7DEF2` | Soft surfaces, assistant chat bubbles, meter track |
| `resist-white` | `#F7F4EC` | Page background, cards |
| `cloth-fade` | `#E6E0D2` | Hairline borders, dividers, map chrome |
| `cassava-gold` | `#C9A227` | Sparse highlights, QR frame, selected pin |
| `kola-brown` | `#6B3F1D` | Secondary links, workshop captions |
| `ink` | `#1A1714` | Body text |
| `muted` | `#5C574E` | Helper text, timestamps |
| `genuine` | `#0F6B4C` | Verdict color only when the API returns genuine |
| `print` | `#9B2C2C` | Verdict color only when the API returns factory print |
| `uncertain` | `#8A6A12` | Verdict color for abstain or stub |

Never use `genuine` green on a stub response (`model_version` is `stub`, or confidence is 0). Mark fixture sellers and stub passports with a gold-outline `PLACEHOLDER` pill.

## Typography

- **Display / headings:** [Fraunces](https://fonts.google.com/specimen/Fraunces), 600–700, soft optical size. Display 32–40px / 1.1, title 22–24px.
- **Body / UI:** [Figtree](https://fonts.google.com/specimen/Figtree), 400/500/600. Body 16px / 1.5, caption 13px / 1.4. Good later support for Yoruba diacritics.
- **Mono / IDs:** [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for piece IDs, QR labels, and the confidence number.
- Line length on the result card ≤ 60 characters. `text-wrap: balance` on headings.

## Shared components

- **Upload dropzone** — dashed `indigo-dye` border on `resist-white`, 16px radius (999px on the primary capture button), large photo icon, copy: “Photograph the cloth. Front, then the back if you can.” Show a thumbnail after capture.
- **Scan overlay** — wait state only. Vertical `indigo-dye` scan line and a short dye-bloom (opacity). Never present the animation as a result.
- **Result card** — verdict word, confidence meter, 2–4 reason bullets, quieter price-guidance inset marked `PLACEHOLDER` if prices are not from the API. Always include “This is not a certificate.”
- **Confidence meter** — track `indigo-mist`, fill `indigo-dye`. Empty bar + “Model not loaded.” when the model is a stub or confidence is 0.
- **Seller map** — full-width Leaflet + OSM (no Google tiles, no API key). Circular indigo pins, gold selected state, bottom sheet, “Open in Google Maps” text button, “Use my location.”
- **Passport card** — cream card, modest indigo mark (not a government seal), workshop, market, date, 2–3 photos, public ID, QR in a 4px gold frame. Never a phone number.
- **Chat** — user bubbles right, `indigo-dye` on white; assistant left, `indigo-mist`. Language chip `EN / YO / HA / IG / PCM`. Hold-to-talk when voice routes are available; text still works if they return 503.
- 4px grid. Card padding 20–24px. Section gap 32px.

## Screens

### 0. Landing / Check entry

**Layout (mobile first).** Full-bleed hero photograph of real Adire (indigo and resist-white), short Fraunces headline, one sentence of body, a 999px primary button “Photograph the cloth,” and a quieter text link “Choose a photo.” Four small text links or a bottom nav: Check, Sellers, Passport, Chat. Do not build a marketing features-grid page.

**Reference:** ARA Lagos mobile homepage. Two figures in indigo-and-white Adire fill the hero; a cream band below carries a short brand line in an editorial serif. That is the mood and crop. [aralagos.com/en-us](https://aralagos.com/en-us), saved as `09-landing-ara.jpg`.

**Cloth texture (imagery only, not a layout to copy):** Studio 189 Hand-Batik Cotton Stanley Shirt, resist-white on indigo. [studiooneeightynine.com](https://studiooneeightynine.com/), saved as `10-cloth-studio189-batik.jpg`. Use a similar photograph in the hero slot if a consented workshop photo is available; otherwise keep a well-sized photo placeholder with this art direction. Do not fake the cloth with CSS patterns behind text.

### 1. Camera / upload + scan

**Layout.** After the user takes or chooses a photo, the photo fills the upper two-thirds. Corner brackets frame the cloth. A one-line wait label sits over the image (“Reading the cloth…”). A result card is not visible yet. Offer Retake / Use photo before the scan starts.

**References:**

- Primary: PictureThis “Identify Toxic Plants & Weeds” App Store screenshot — live photo, corner brackets, a brief green highlight over the subject, and a bottom card that appears after recognition. [App Store](https://apps.apple.com/us/app/picturethis-plant-identifier/id1252497129), saved as `01-scan-picturethis.jpg`.
- Secondary: Seek by iNaturalist camera — species name and a row of confidence dots over the live photo, a shutter, and the wait copy “Keep scanning the environment…”. Use the overlay structure; change the dots into our indigo meter later on the result screen. [App Store](https://apps.apple.com/us/app/seek-by-inaturalist/id1353224144), saved as `02-scan-seek.jpg`.
- Framing only: Adobe Scan crop overlay (corner handles around the subject) if a manual adjust step is needed. [App Store](https://apps.apple.com/us/app/adobe-scan-pdf-doc-scanner/id1199564834). Not saved in `design/refs/` (the official camera marketing shots were before/after document cleanups, not a live scan line).

### 2. Verdict / result

**Layout, top to bottom:** (1) the submitted photo, (2) Fraunces verdict word in the matching token color, (3) IBM Plex Mono confidence with a bar or ring, (4) 2–4 short reason bullets, (5) a quieter price-guidance inset, clearly `PLACEHOLDER` unless the API supplies it, (6) “This is not a certificate.”, (7) actions: “Find a seller,” “Save a passport,” “Ask in my language.” If `model_version` is `stub` or the weights are missing, show “Model not loaded.” and `uncertain` styling — never a confident genuine/print stamp.

**References:**

- Primary: Pl@ntNet Identification screen — query photos on top, a “Results” list with a numeric score (example: 4.87 and stars) and a confirm action. Adapt the stack; replace stars with our indigo confidence bar, and do not ask the user to “confirm” the model’s class. [App Store](https://apps.apple.com/us/app/plantnet/id600547573), saved as `03-verdict-plantnet.jpg`.
- Secondary: Seek species page — large photo, a small category chip, the common name, a scientific/secondary line, a status chip, then a short “About” explanation. Use this hierarchy for verdict + explanation. Same [Seek App Store listing](https://apps.apple.com/us/app/seek-by-inaturalist/id1353224144), saved as `04-result-seek.jpg`.

Pitch copy, if shown, must stay honest: “On 27 held-out real photos, the model was 100% correct and never called a factory print genuine.” Do not claim general accuracy.

### 3. Sellers map + list

**Layout.** Full-width map on the top half. Circular `indigo-mid` pins, `cassava-gold` when selected. A rounded `resist-white` bottom sheet lists the stall name, market, city, a short note, and “Open in Google Maps.” A “Use my location” control sits on the map. Leaflet + OSM tiles only.

**Reference:** Airbnb “Daily itineraries map out your trip” App Store screenshot — map with category pins, a selected dark pin, a bottom sheet titled with the place name, a listing card, and “Get directions.” Swap directions for our Google Maps text button and drop the category-icon candy. [App Store](https://apps.apple.com/us/app/airbnb/id401626263), saved as `05-map-airbnb.jpg`.

### 4. Adire Passport + QR

**Layout.** A cream card (radius 16px, QR and stamp at 4px). Title “Adire Passport,” workshop, market, date, public ID in IBM Plex Mono, 2–3 photos, and a large QR (`qrcode.react`) linking to `/passport/:id`, in a gold hairline frame. One modest indigo mark, not a coat of arms. Caption: “A public record of this check. This is not a certificate.”

**References:**

- Primary: Google Wallet event ticket — title, venue, large QR on a contrasting tile, public ID under the code, a date/time/meta row, and a photo beneath the pass. Invert the dark theme to `resist-white` / `indigo-ink`. [App Store](https://apps.apple.com/us/app/google-wallet/id6761386270), saved as `06-passport-wallet.jpg`.
- QR scale only: CovPass Cyprus presenting a large, readable QR under the holder name. Borrow the size and centering. Do not copy the EU mark, government header, or health-certificate language. [App Store](https://apps.apple.com/us/app/covpass-cyprus/id1572945485), saved as `07-passport-covpass.jpg`.

### 5. Chat + voice

**Layout.** Language chip in the header. Transcript fills the screen. User bubbles right (`indigo-dye`), assistant left (`indigo-mist`). Composer: text field, plus a mic that uses hold-to-talk when `/voice/*` is available. If those routes return 503, hide the recording chrome and keep text. Do not put Intron or Groq keys in `VITE_*`.

**Reference:** WhatsApp “Message privately…” App Store screenshot — incoming/outgoing bubbles, a voice-note playback chip, and a hold-to-record bar (“0:01 / slide to cancel”) with a mic. Reuse the interaction, not the wallpaper or green brand color. [App Store](https://apps.apple.com/us/app/whatsapp-messenger/id310633997), also described on [whatsapp.com/messaging](https://www.whatsapp.com/messaging), saved as `08-chat-whatsapp.jpg`.

## Motion (Framer Motion, 2-hour build)

Follow `design/DESIGN_SYSTEM.md`: UI 180ms, scan 600–1200ms, easing `cubic-bezier(0.22, 1, 0.36, 1)` (`easeOut` is close; prefer a custom `ease: [0.22, 1, 0.36, 1]`). Respect `prefers-reduced-motion`: skip the scan line and pin drop; fade the result card in over 200ms. Do not loop the scan after the result is visible. No bouncing pins.

Shared transition:

```ts
export const easeOutCloth = [0.22, 1, 0.36, 1] as const
```

### 1. Scan-line sweep (after upload, before the result)

- Photo stays still. A 2px `indigo-dye` line (`#1C3F8A`) moves from `top: 0` to `top: 100%` over **900ms**, `ease: easeOutCloth`, `repeat: 1` (two passes max), `repeatType: "reverse"`.
- A 48px linear gradient trails the line (`indigo-dye` at 0.28 opacity to transparent).
- Optional “dye bloom”: a full-photo overlay animates opacity `0 → 0.12 → 0` over **1200ms**.
- Label: “Reading the cloth…” in Figtree 13px `muted`. This is a wait state, not a verdict.
- Reduced motion: no line; 200ms fade on the photo and the label.

### 2. Verdict stamp reveal

- After the scan ends, the verdict word mounts with `initial={{ opacity: 0, scale: 0.86, rotate: -3 }}` `animate={{ opacity: 1, scale: 1, rotate: 0 }}` `transition={{ duration: 0.4, ease: easeOutCloth }}`.
- Color comes only from `genuine` / `print` / `uncertain`. No gold seal, no certificate badge, no drop shadow that looks official.
- Reduced motion: opacity 0→1 over 200ms, no rotate or scale.

### 3. Confidence ring or bar count-up

- Prefer a horizontal bar (faster to build); a 64px SVG ring is optional.
- Track `indigo-mist`. Fill width (or `pathLength`) animates `0 → confidence` over **700ms**, `delay: 0.2`, `ease: easeOutCloth`.
- The IBM Plex Mono number counts up in sync (same 700ms). Show a percentage or 0.00–1.00, matching the API.
- Stub / 0.0: leave the bar empty and set the label to “Model not loaded.”
- Reduced motion: set the final width immediately.

### 4. Staggered cards

- Reasons, price inset, and action buttons use a parent `variants` with `staggerChildren: 0.08`, `delayChildren: 0.15`.
- Child: `initial={{ opacity: 0, y: 16 }}` `animate={{ opacity: 1, y: 0 }}` `transition={{ duration: 0.35, ease: easeOutCloth }}`.
- Reduced motion: no `y`, 200ms fade.

### 5. Map pin drop

- Each pin: `initial={{ opacity: 0, y: -12 }}` `animate={{ opacity: 1, y: 0 }}` `transition={{ duration: 0.4, ease: easeOutCloth, delay: index * 0.04 }}`.
- Selected pin only changes fill to `cassava-gold` (180ms). No bounce, no loop, no pulse.
- Reduced motion: pins appear with no offset.

## Decision ledger

| Decision | Source | Role to preserve | Why |
| --- | --- | --- | --- |
| Indigo + resist-white tokens, Fraunces / Figtree / Plex Mono | `DESIGN_SYSTEM.md` | Brand tokens stay in their listed roles | Existing system; do not invent a second palette |
| Full-bleed Adire photography over a cream intro band | ARA Lagos homepage | Photography is the hero, type is secondary | Warm cultural entry without a generic SaaS landing |
| Viewfinder + wait overlay, then a rising result card | PictureThis App Store screen; Seek camera | Scan is a wait state | Matches the photograph-then-identify job |
| Photo, named result, numeric score, then explanation | PlantNet Identification; Seek species page | Score is evidence, not decoration | Honest hierarchy for a small-model verdict |
| Map on top, seller sheet below, external directions link | Airbnb itinerary map screenshot | OSM map, text “Open in Google Maps” | Builds in 2 hours with Leaflet, no API key |
| Cream pass, large QR, public ID, date, photos | Google Wallet ticket; CovPass QR scale only | Not a government certificate | Readable QR without overclaiming |
| Hold-to-talk + voice-note chip, language chip in the header | WhatsApp chat screenshot; design system chat rules | Mic is optional; text always works | Matches Intron when present, degrades cleanly |

## Saved reference images

Files live in `/workspace/adiretrust-design-refs/` and, on `main`, under `design/refs/`.

| File | Note |
| --- | --- |
| `01-scan-picturethis.jpg` | PictureThis live camera with corner brackets and a rising ID card |
| `02-scan-seek.jpg` | Seek camera with name overlay, confidence dots, and shutter |
| `03-verdict-plantnet.jpg` | PlantNet ranked identification results with a numeric score |
| `04-result-seek.jpg` | Seek species page: photo, chips, name, and explanation |
| `05-map-airbnb.jpg` | Airbnb map pins plus a bottom sheet and “Get directions” |
| `06-passport-wallet.jpg` | Google Wallet event ticket: title, QR, public ID, metadata |
| `07-passport-covpass.jpg` | CovPass Cyprus large QR (scale only; do not copy official chrome) |
| `08-chat-whatsapp.jpg` | WhatsApp thread with a voice note and hold-to-record bar |
| `09-landing-ara.jpg` | ARA Lagos mobile hero: indigo Adire photography + cream intro |
| `10-cloth-studio189-batik.jpg` | Studio 189 indigo batik shirt, for cloth art direction |

The six files copied into `design/refs/` for the repo are `01`, `03`, `05`, `06`, `08`, and `09` (all under 300 KB). The others remain in this folder and are still cited above.
