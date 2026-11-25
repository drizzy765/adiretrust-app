# Model weights

Commit the Colab-trained probe files here, on `main`:

- `dinov2_vits14_logreg.joblib`
- `label_map.json`

Paul: download both from the Colab file panel at `adiretrust-app/model/weights` after the `c7350fb` run, then commit them to this folder. They are small, so committing is fine.

The root Docker image should copy this directory to `/app/model/weights` and set `MODEL_DIR=/app/model/weights`. Feature caches (`.npy`) and torch checkpoints are gitignored.
