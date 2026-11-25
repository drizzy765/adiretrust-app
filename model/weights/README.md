# Model weights

The Colab-trained probe files are committed here on `main`:

- `dinov2_vits14_logreg.joblib`
- `label_map.json`

These files match the run recorded in [`../EVAL.md`](../EVAL.md). When replacing them, keep the probe and label map from the same run and update that evaluation report.

The root Docker image should copy this directory to `/app/model/weights` and set `MODEL_DIR=/app/model/weights`. Feature caches (`.npy`) and torch checkpoints are gitignored.
