# AdireTrust — presentation plan (3:00 total)
**Speaker split: SUGGESTED.** Change it freely. Timi: intro, problem, demo. Paul: data collection and training. David: backend, deploy and business.
Live app: **http://102.209.47.246**

## Run of show
| # | Slide | Speaker | Time | Cumulative |
|---|-------|---------|------|-----------|
| 1 | Title | Timi | 0:10 | 0:10 |
| 2 | The problem, in the news (Punch 2025, Vanguard 2024, Guardian 2023) | Timi | 0:20 | 0:30 |
| 3 | Why we chose this / What we solve | Timi | 0:10 | 0:40 |
| 4 | We went to the workshop | Paul | 0:20 | 1:00 |
| 5 | The solution, then the **LIVE DEMO** | Timi | 0:10 + 0:35 | 1:45 |
| 6 | How it works (stack, Nobus deploy) | David | 0:10 | 1:55 |
| 7 | How we trained it | Paul | 0:15 | 2:10 |
| 8 | Results | Paul | 0:10 | 2:20 |
| 9 | Results in detail | Paul | 0:08 | 2:28 |
| 10 | Beyond the verdict | Timi | 0:07 | 2:35 |
| 11 | Impact & business model | David | 0:10 | 2:45 |
| 12 | Caveat & roadmap | Paul | 0:08 | 2:53 |
| 13 | Team & ask | Timi | 0:07 | 3:00 |

## Live demo (35 s, Timi; David stands by on the laptop)
Set up before you go on stage: open http://102.209.47.246 in a browser tab, have one genuine workshop photo saved locally, and use a desktop width or a phone mirrored to the screen.
1. **Upload** the workshop photo (about 5 s).
2. **Verdict**: let the scan line finish, then read out the verdict, confidence and explanation (about 10 s).
3. **Sellers map**: tap a pin and show "Open in Google Maps" (about 7 s).
4. **Passport QR**: open the Adire Passport for the verified piece (about 5 s).
5. **Yoruba chat**: switch the language to Yorùbá, ask "Ṣé òótọ́ ni aṣọ yìí?", and show the reply (about 8 s).

## Backup plan (if the app or Wi-Fi fails)
- **Switch within 5 seconds. Don't debug on stage.** Say: "The network is slow, so here's the same flow recorded earlier."
- Plan A: a phone hotspot (David's phone), already paired with the laptop.
- Plan B: a screen recording of the same five steps, saved **offline** on the laptop desktop and on a USB stick. Record it today.
- Plan C: present slides 5, 8 and 10 as the demo and narrate the flow.
- The deck itself runs offline: use `AdireTrust-pitch.pdf` (fonts embedded). `deck.html` needs internet for the Google Fonts.
- If the app returns a **stub** response (the model is not loaded), say so honestly and switch to the recording. Never present a stub as a real verdict.

## Likely judge questions, with honest answers
1. **"Isn't the dataset tiny?"** Yes. We have 81 genuine photos from one workshop and 100 prints, and the test set is 27 photos. 27/27 is promising, not proof. Next we'll photograph more workshops and regions; we have the process from this trip.
2. **"Could the same cloth be in both train and test?"** It's possible. Right now each photo has its own ID (one image = one piece_id), so the split is by image, not by physical piece. Grouping photos of the same cloth into one piece_id is the next fix. The test photos were never used for training or for picking the threshold.
3. **"What happens when the model isn't sure, or isn't loaded?"** Below 0.6 confidence it says "uncertain" instead of guessing; it did that once on validation. If the model files are missing, the API returns an error or a clearly labelled stub. It never shows a fake "genuine".
4. **"Where does the naira price guidance come from?"** Honest answer: in the current backend, price guidance is a **placeholder** ("Not a real market quote"). We'll add real buy/sell ranges only after collecting local price sources with artisans and cooperatives. (Press reports, e.g. Vanguard 2024, cite imitations at about half the price of local fabric; that is context, not our price model.)
5. **"How does this scale?"** The model is light: a frozen backbone plus a linear probe, so it runs cheaply on a Nigerian cloud (Nobus). Scaling needs data first: more workshops, cooperatives verifying their members (an artisan verification fee), and a free buyer app. New regions mean new photos, then retraining the probe, not training a big model from scratch.
