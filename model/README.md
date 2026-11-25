# Model — DINOv2 linear probe

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb)

This folder is for training and exporting the cloth-check classifier. The live API in `backend/` does not import torch and currently returns a stub.

## Train on Google Colab (primary)

All pretraining should run on a Colab GPU, not on the API host.

1. Open [model/train_colab.ipynb](https://colab.research.google.com/github/drizzy765/adiretrust-app/blob/main/model/train_colab.ipynb) in Colab.
2. Set the runtime to GPU.
3. Run the cells: they clone this repo, optionally mount the missing print photos from Drive, extract frozen DINOv2 ViT-S/14 features, train a logistic regression probe, evaluate val/test with **computed** metrics, and write `EVAL.md`.
4. Download `model/weights/dinov2_vits14_logreg.joblib` and `label_map.json` (or copy them to Drive), then commit those small files or hand them to David for `POST /check`.

`model/train_probe.py --dry-run` remains a local way to inspect the manifest without torch. It does not replace the Colab notebook.


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

Paul owns preprocessing and training. Timi helps with training and evaluation. David wires a successful checkpoint into `POST /check` later.

## Data rules

- Use `data/labels/labels.csv` and `data/labels/splits.csv`.
- **Osun workshop:** 81 genuine images are in `data/raw/osun_genuine/` (and resized copies under `data/processed/osun_workshop/224` and `512`). The manifest also lists 100 print images under `data/raw/osun_prints/`, but those files were **not present** in the public `drizzy765/AdireTrust` git history (raw media was gitignored). Do not invent print photos. If Paul has the local print folder, add it here with consent review and an honest count.
- **Synthetic** images in `data/raw/synthetic/` are procedural textures, not real textiles. They are assigned to `train` only. Keep them out of val/test and out of any reported score.
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

Report precision and recall on both classes, the false-genuine count, a confusion matrix, and an abstain rate at the chosen threshold. Tune the threshold on validation, never on test. See `docs/model-methodology.md`.

## How to run (once torch is installed locally)

```bash
python -m pip install -r model/requirements-train.txt
python model/train_probe.py --data-dir data --image-root data/processed/osun_workshop/224 --dry-run
```

The skeleton supports `--dry-run` without torch so the script can be inspected on a small machine. Full training should use the Colab notebook. Training will fail clearly if the print photos are still missing.
