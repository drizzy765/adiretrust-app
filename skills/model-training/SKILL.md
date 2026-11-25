# Skill: model training

Use this when training or evaluating the cloth classifier.

## Owner

Paul Adewole, with Timi helping on training and eval.

## Do

- **Primary path:** train on **Google Colab** with [`model/train_colab.ipynb`](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) (GPU runtime). Follow the staged plan in Notion [AdireTrust — Hackathon Prep Plan](https://app.notion.com/p/4199e1028e8581b4a2a6f210c2a32cf8) §8 and `docs/research-plan.md` §6–7.
- **Default run:** frozen **DINOv2 ViT-S/14** + **logistic regression** on field photos. Optional `RUN_*` cells (off by default): k-NN vs logreg; SigLIP and frozen EfficientNet-B0; DINOv2 ViT-B and patch tokens; CLIP/SigLIP zero-shot; Stage-2 DTD/batik notes with **no auto-download**; train-only aug + last-block fine-tune; patch-similarity heatmap; multi-shot aggregation when `view_tag` is real.
- Local inspect-only helper: `model/train_probe.py --dry-run` (no torch). See `model/README.md`.
- Use `data/labels/labels.csv` and `splits.csv`. Synthetics are train-only. Skip Commons (not copied, unsplit).
- Prefer `data/processed/osun_workshop/224/` when raw resizing is not ready.
- 81 genuine Osun photos are in the repo. The 100 print photos are in the manifest but were missing from the public source git. Do not invent a print set. If you have the local folder, add it and state the new n.
- Split unit is physical `piece_id`. Current IDs are provisional (one image per ID).
- Report precision and recall on both classes, false-genuine count, confusion matrix, abstain/coverage, n, and the split rule. Compute ROC-AUC only when both classes exist. Sweep the abstain threshold on val (also report 0.6), then apply it to test. Write `EVAL.md` from the run. Do not invent numbers.
- Save the probe to `model/weights/dinov2_vits14_logreg.joblib` and `model/weights/label_map.json`. Those small files are **not** gitignored and can be committed, or uploaded for David to load in `/check`. Feature caches under `model/runs/` are gitignored.

## Don’t

- Don’t invent accuracy or paste a batik paper’s number as an AdireTrust result.
- Don’t train from scratch or unfreeze the whole backbone on this small set. Last-block fine-tune stays off until the probe is useful and n is large enough (the plan says do not full-network fine-tune on fewer than 300 pieces).
- Don’t auto-download Stage-2 datasets (batik, DTD, AITEX) in the default run.
- Don’t put synthetic or unreviewed web images in val/test.
- Don’t install torch into the API Docker image unless inference is actually wired and still documented.
