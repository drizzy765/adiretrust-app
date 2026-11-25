# Model — DINOv2 linear probe

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb)

This folder is for training and exporting the cloth-check classifier. The API lazily imports torch only when the exported probe artifacts are present. Until then, `POST /check` returns HTTP 503 with a clear missing-model message.

## Train on Google Colab (primary)

All pretraining should run on a Colab GPU, not on the API host.

1. Open [model/train_colab.ipynb](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) in Colab.
2. Set the runtime to GPU.
3. Run the **default** cells: they clone this repo, download the public **AdireTrust-data** Drive folder with `gdown` (or mount Drive if you already have it at `/content/drive/MyDrive/AdireTrust-data`), extract frozen **DINOv2 ViT-S/14** features, train a **logistic regression** probe, evaluate val/test with **computed** metrics (P/R on both classes, false-genuine count, ROC-AUC if both classes exist, val threshold sweep), and write `EVAL.md`.
   Folder: https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN — layout `raw/osun_genuine`, `raw/osun_prints`, `raw/synthetic`.
4. Optional cells are **off by default** (`RUN_*` flags): k-NN vs logreg; SigLIP and frozen EfficientNet-B0 probes; DINOv2 ViT-B and patch tokens; CLIP/SigLIP zero-shot with the plan prompts; Stage-2 DTD/batik notes (no auto-download); train-only augmentation + last-block fine-tune; a DINOv2 patch-similarity heatmap; multi-shot aggregation when `view_tag` is real.
5. Download `model/weights/dinov2_vits14_logreg.joblib` and `label_map.json` (or copy them to Drive), then commit those small files or hand them to David for `POST /check`.

`model/train_probe.py --dry-run` remains a local way to inspect the manifest without torch. It does not replace the Colab notebook.


## Engineering plan (source of truth)

The notebook follows the staged transfer plan in:

- Notion [AdireTrust — Hackathon Prep Plan](https://app.notion.com/p/4199e1028e8581b4a2a6f210c2a32cf8) §8 and §3
- [`docs/research-plan.md`](../docs/research-plan.md) §6–7 and [`docs/model-methodology.md`](../docs/model-methodology.md)
- [`docs/PLAN.md`](../docs/PLAN.md)

**Stages:** (1) frozen DINOv2 or SigLIP backbone, (2) optional related-task data (batik / DTD / AITEX — not auto-downloaded), (3) web + synthetic **train only**, (4) real field photos. **Experiment order:** zero-shot CLIP/SigLIP, then frozen linear probe or k-NN (DINOv2, SigLIP, EfficientNet; global and patch tokens), then fine-tune only the val winner (last blocks, ~1e-5) if n is large enough, then ablations. Do not train from scratch. Do not full-network fine-tune on fewer than 300 pieces.

The **default Colab path** is still Stage-4 field data + a frozen **DINOv2 ViT-S/14** + **logistic regression** probe. That is the first real score the plan asks for.


## Task

Given a photo of a cloth, predict one of:

- `genuine_hand_dyed`
- `factory_print`
- `uncertain` (abstain when confidence is below `CONFIDENCE_THRESHOLD`, default 0.6)

A false "genuine" on a factory print is the costly error. Prefer abstaining over overconfident genuine calls.

## Recommended first experiment

1. Load a **frozen DINOv2 ViT-S/14** backbone (for example `vit_small_patch14_dinov2.lvd142m` via `timm`).
2. Extract embeddings for each training image.
3. Fit a regularized **linear probe** (logistic regression) on those embeddings.
4. Do **not** train a CNN from scratch, and do not fine-tune the whole backbone until there are enough confirmed physical pieces.

Paul owns preprocessing and training. Timi helps with training and evaluation. The current exported checkpoint is wired into `POST /check`; future checkpoints should include the matching `label_map.json` and evaluation report.

## Data rules

- Use `data/labels/labels.csv` and `data/labels/splits.csv`.
- **Images are not in git.** Get them from [AdireTrust-data](https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN) (`raw/osun_genuine`, `raw/osun_prints`, `raw/synthetic`). Repo paths with the same layout are a fallback only.
- **Osun workshop:** 81 genuine photos. The manifest also lists 100 print images; add those to `raw/osun_prints/` in Drive when you have them. Do not invent print photos.
- **Synthetic** images are procedural textures, not real textiles. They are assigned to `train` only. Keep them out of val/test and out of any reported score.
- **Wikimedia Commons** rows in the manifest were left unsplit and are **not copied** into this repo pending human review.
- Current Osun IDs are provisional (one image = one piece). Do not report a split metric as a physical-piece held-out benchmark until related views are grouped.
- Record n images, n pieces, the split rule, and the date next to every number used in a pitch. **Do not invent accuracy.**

## Preprocessing notes

- Start with the 224px processed workshop images, or resize/crop raw photos to 224×224.
- Use the DINOv2 / ImageNet-style normalization expected by the backbone (see `timm` model config).
- Light train-only augmentation is allowed later (small rotations, mild blur, lighting jitter). Do not invent dye bleed or reverse-side cues.
- When front, back, and macro views exist for one physical piece, keep them in the same split. Score views separately, then consider a simple aggregation.
- Reject clearly empty or non-cloth frames before training.

## Evaluation

Report precision and recall on **both** classes, the false-genuine count, a confusion matrix, coverage/abstain rate, and ROC-AUC **only when both classes are present**. Sweep the abstain threshold on **val** (still report the app default 0.6), then apply the chosen threshold to test. Never tune on test. See `docs/model-methodology.md` and write the computed numbers into `EVAL.md`.

## How to run (once torch is installed locally)

```bash
python -m pip install -r model/requirements-train.txt
python model/train_probe.py --data-dir data --image-root data/processed/osun_workshop/224 --dry-run
```

The skeleton supports `--dry-run` without torch so the script can be inspected on a small machine. Full training should use the Colab notebook. Training will fail clearly if the print photos are still missing.
