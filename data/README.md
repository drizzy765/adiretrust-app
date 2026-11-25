# Data

Copied from the public research repository [drizzy765/AdireTrust](https://github.com/drizzy765/AdireTrust) (commit `ca6c468` on `main` at copy time).

## What is here

| Set | Count | Location | Notes |
| --- | --- | --- | --- |
| Osun workshop genuine (raw) | 81 | `raw/osun_genuine/` | Placed on the path `labels.csv` expects. Source git stored these under `data/raw/osun_workshop/`. |
| Same images, 224px | 81 | `processed/osun_workshop/224/` | Convenient for a first probe. |
| Same images, 512px | 81 | `processed/osun_workshop/512/` | |
| Synthetic textures | 24 | `raw/synthetic/` | **Train only.** Not real textiles. Keep out of val/test and out of reported scores. |
| Manifest | 221 rows | `labels/labels.csv` | Also lists 100 Osun prints and 16 Commons rows. |
| Splits | 205 rows | `labels/splits.csv` | 181 Osun + 24 synthetic. Commons were left unsplit. |

Also copied: `labels/piece_groups_review.csv`, `labels/rejected_media.csv`.

Current Osun IDs are provisional (one image ≈ one piece). That is not a physical-piece benchmark.

## What was not copied

- **100 Osun print photos** (`data/raw/osun_prints/` in the manifest). They were not present in the public git tree (`/data/raw/` and `/data/processed/` are gitignored in the research repo; only the 81 genuine files had been force-added). If you have the local print folder, add it after a consent check and update this README with real counts.
- **16 unsplit Wikimedia Commons** images (and extra unlisted Commons files in the research repo).
- Scrapers, pipeline scripts, and small one-off crawl folders (Jumia, AliExpress, Alibaba, and similar).
- `.env` files and keys (none were copied).

## Consent

See `docs/data-and-consent.md`. Folder labels and `consent=yes` in the manifest are not an independent audit. Confirm scope before any new public use of workshop photos.
