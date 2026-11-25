# Data

Labels and splits stay in this repo. **Image files are not in git** — they made clones too large.

Training photos live in the Google Drive folder **AdireTrust-data**:

https://drive.google.com/drive/folders/1k1j2mNU1H5ST74AJp3qGEly67kEdnPNN

The folder should be **Anyone with the link, Viewer** (no individual email invites). The Drive API used here cannot flip that setting, so Timi must do it once in the Drive UI: Share → General access → Anyone with the link → Viewer. Until that is on, `gdown --folder` will fail for teammates. Teammates should use that link, or download it in Colab with `gdown` (see `model/train_colab.ipynb`). If you own the folder, you can instead mount Drive and use `/content/drive/MyDrive/AdireTrust-data`.

## Expected layout of `AdireTrust-data`

```
AdireTrust-data/
  raw/osun_genuine/     # 81 Osun workshop genuine photos
  raw/osun_prints/      # 100 Osun print photos (add when available)
  raw/synthetic/        # 24 train-only procedural textures
```

The Colab notebook also accepts `AdireTrust-data/data/raw/...` and, as a fallback, the same folders under this repo (`data/raw/osun_genuine`, `data/raw/osun_prints`, `data/raw/synthetic`, plus `data/processed/osun_workshop/{224,512}` if you have them locally). Do not commit those image directories.

## What is in git

| Set | Location | Notes |
| --- | --- | --- |
| Manifest | `labels/labels.csv` | 221 rows, including 81 genuine, 100 prints, 24 synthetic, 16 Commons. |
| Splits | `labels/splits.csv` | 181 Osun + 24 synthetic. Commons were left unsplit. |
| Review lists | `labels/piece_groups_review.csv`, `labels/rejected_media.csv` | Copied from the research repo. |

Current Osun IDs are provisional (one image ≈ one piece). That is not a physical-piece benchmark.

## Image sets (in Drive, not git)

| Set | Count | Drive path | Notes |
| --- | --- | --- | --- |
| Osun workshop genuine | 81 | `raw/osun_genuine/` | Paths in `labels.csv` are `data/raw/osun_genuine/<file>`. |
| Osun prints | 100 listed | `raw/osun_prints/` | Upload these into the Drive folder when you have them. Do not invent a print set. |
| Synthetic textures | 24 | `raw/synthetic/` | **Train only.** Not real textiles. Keep out of val/test and out of reported scores. |

Optional local processed copies (224px / 512px) may exist at `data/processed/osun_workshop/` on a machine that already has them; they are gitignored.

## Consent

See `docs/data-and-consent.md`. Folder labels and `consent=yes` in the manifest are not an independent audit. Confirm scope before any new public use of workshop photos.

## Cloning this repo

A **full-history** clone still contains the old image blobs in git history. Use a shallow clone to avoid downloading them:

```bash
git clone --depth 1 https://github.com/drizzy765/adiretrust-app.git
```
