# AdireTrust design system

The visual language is **hand-dyed Abeokuta adire**: deep indigo, resist-white pattern, a little sun-faded cloth, and calm gold for trusted actions. It should feel like a market stall and a workshop, not a generic fintech dashboard.

Use these tokens in the Vite + React UI. Do not invent a “certified authentic” badge style that overclaims the model.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `indigo-ink` | `#0B1F4A` | Page background option, headings on light, passport stamps |
| `indigo-dye` | `#1C3F8A` | Primary actions, scan line, links |
| `indigo-mid` | `#3A5FB0` | Hover, focus rings, map pin fill |
| `indigo-mist` | `#D7DEF2` | Soft surfaces, chat bubbles, disabled tracks |
| `resist-white` | `#F7F4EC` | Page background (cloth / paper), cards |
| `cloth-fade` | `#E6E0D2` | Borders, dividers, map chrome |
| `cassava-gold` | `#C9A227` | Highlights, QR frame, selected pin (use sparingly) |
| `kola-brown` | `#6B3F1D` | Secondary text links, workshop captions |
| `ink` | `#1A1714` | Body text |
| `muted` | `#5C574E` | Helper text, timestamps |
| `genuine` | `#0F6B4C` | Verdict only when the model actually returns genuine |
| `print` | `#9B2C2C` | Verdict only when the model actually returns factory print |
| `uncertain` | `#8A6A12` | Verdict for abstain / stub |

Never use `genuine` green on a stub response. The current API always returns `uncertain`.

## Typography

- **Display / headings:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (soft optical size, 600–700). Feels like a printed label, not a tech startup sans.
- **Body / UI:** [Figtree](https://fonts.google.com/specimen/Figtree) (400/500/600). Good Latin multilingual support for later Yoruba diacritics.
- **Mono / IDs:** [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for piece IDs, QRs, confidence numbers.

Sizes (mobile first): display 32–40px / 1.1, title 22–24px, body 16px / 1.5, caption 13px / 1.4. Line length on the result card ≤ 60 characters where possible.

## Spacing and shape

- 4px base grid. Card padding 20–24px. Section gap 32px.
- Corner radius 16px on cards, 999px on pills and the upload button, 4px on QR and passport stamps (a slightly sharper official mark).
- Hairline borders in `cloth-fade`. One indigo left-edge or resist-pattern watermark on the passport card, not a busy background behind text.

## Components

- **Upload dropzone** — dashed indigo border on `resist-white`, large photo icon, text: “Photograph the cloth. Front, then the back if you can.” Show a thumbnail after choose/capture.
- **Scan overlay** — a vertical indigo scan line and a short “dye bloom” (opacity only) for ~1.2s after upload. Label it as a wait state, not a result.
- **Result card** — verdict word, confidence meter, 2–4 reason bullets, price guidance in a quieter inset clearly marked if PLACEHOLDER. Include “This is not a certificate.”
- **Confidence meter** — track in `indigo-mist`, fill in `indigo-dye`. For the stub (0.0), keep the bar empty and say “Model not loaded.”
- **Seller map** — full-width Leaflet map, OSM tiles, circular indigo pins with a gold selected state, a bottom sheet for the stall name, and an “Open in Google Maps” text button (no Google tile layer, no API key).
- **Passport card** — cream background, indigo stamp, workshop name, market, date, 2–3 photos, public ID (never a phone number).
- **Chat** — right-aligned user bubbles in indigo, left-aligned assistant in `indigo-mist` on white; a language chip (EN / YO / HA / IG / PCM); optional hold-to-talk when Intron is configured.
- **Placeholder badge** — small gold-outline pill reading `PLACEHOLDER` on fixture sellers and stub passports.

## Motion

- Duration: 180ms for UI, 600–1200ms for the scan. Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Respect `prefers-reduced-motion`: skip the scan line, fade the card in instead.
- Do not loop the scan after the result is visible.
- Map pins may ease in once; no bouncing.

## Imagery and iconography

Prefer real workshop photos (with consent) over stock Ankara. Icons: simple line style, 1.75px stroke, indigo. A resist-dot or cassava-stencil motif is allowed as a decorative corner, not as a logo lockup that looks like a government seal.

## Do / don’t

- Do leave generous padding; market buyers use this on a phone in sun and shade.
- Do show uncertainty with the same visual weight as a decisive verdict.
- Don’t use red-alarm typography for factory print; be clear, not shaming.
- Don’t display a fake heatmap or a made-up percentage.
