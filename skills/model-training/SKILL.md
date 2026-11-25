# Skill: model training

Use this when training or evaluating the cloth classifier.

## Owner

Paul Adewole, with Timi helping on training and eval.

## Do

- Start with a **frozen DINOv2 ViT-S/14** linear probe (`model/train_probe.py`, `model/README.md`).
- Use `data/labels/labels.csv` and `splits.csv`. Synthetics are train-only. Skip Commons (not copied, unsplit).
- Prefer `data/processed/osun_workshop/224/` when raw resizing is not ready.
- 81 genuine Osun photos are in the repo. The 100 print photos are in the manifest but were missing from the public source git. Do not invent a print set. If you have the local folder, add it and state the new n.
- Split unit is physical `piece_id`. Current IDs are provisional (one image per ID).
- Report precision-on-genuine, recall, confusion matrix, abstain rate, n, and the split rule. Tune the threshold on val, not test.
- Save weights under `model/checkpoints/` (gitignored). Tell David the path and label mapping so he can load them in `/check`.

## Don’t

- Don’t invent accuracy or paste a batik paper’s number as an AdireTrust result.
- Don’t train from scratch or unfreeze the whole backbone on this small set.
- Don’t put synthetic or unreviewed web images in val/test.
- Don’t install torch into the API Docker image unless inference is actually wired and still documented.
