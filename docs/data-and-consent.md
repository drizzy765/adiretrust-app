> Note for `adiretrust-app`: this document was copied from the research repo. A subset of workshop photos (81 genuine images, plus 224px/512px copies, and 24 train-only synthetics) is committed here so the app can be built. The 100 print photos and unsplit Commons images were not copied. Treat consent scope as still needing confirmation before any further public reuse.

# Data collection, labels, and consent

## Purpose and current snapshot

This dataset supports research into hand-dyed Adire and factory-printed lookalikes in the Abeokuta market context. The current local manifest has 221 rows: 81 accepted images from `osun_genuine`, 100 from `osun_prints`, 16 Wikimedia Commons records, and 24 synthetic textures. Two genuine-folder images were dropped as near-duplicates; no corrupt files were found. The 181 workshop images are assigned one provisional piece ID per image because filenames do not establish which photos show the same physical cloth. The manifest, review map, and raw photos are local data and are not committed to the public repository.

Other sources in the manifest have different evidentiary value:

- Wikimedia Commons records may be historically or contextually useful, but a title/category is not proof of process or of present-day Abeokuta material.
- Procedural synthetic records are generated patterns, not real textiles. They may be used in training experiments only.
- Some synthetic records are assigned genuine/print labels to distinguish generated pattern families; they are not ground-truth examples of either production process.
- An uncertain label is not a weak synonym for genuine or print. Keep it out of supervised evaluation until reviewed.

Counts change when the manifest is rebuilt. Record the manifest version/date and recompute class/source counts for every experiment or presentation.

## Pipeline overwrite warning

The root `pipeline.py` and `pipeline_v2.py` write over the shared `data/labels/labels.csv`; `pipeline_v2.py` also rewrites splits and rejection reports and uses a fixed manifest schema. Its source-preservation list now includes `osun_genuine`, but its output schema omits collection fields such as `market`, `consent`, and `view_tag`. Do not use either pipeline to rebuild the current manifest until the collection data is backed up and preservation/schema behavior is reviewed. `prep_dataset.py` also rebuilds outputs from `data/raw/osun_genuine`, so verify that directory contains the complete intended collection first.

For the genuine/print pair, use `ingest_dual_class.py`. Its default audit verifies image files, excludes and logs pHash duplicates at the configured threshold, updates `rejected_media.csv`, and writes `piece_groups_review.csv` without changing `labels.csv` or `splits.csv`. The normal `--apply` path requires reviewed cloth status and physical-piece IDs. The explicit `--auto-confirm-workshop` option is available for the supplied folder-labeled collection: it assigns a distinct provisional ID to each image, so it cannot group multiple views of a piece. The resulting 70/15/15 split is therefore image-as-piece stratified, not a verified physical-piece or market-held-out benchmark. Filenames and pHash cannot establish which distinct images show the same cloth. Folder names supply the proposed class labels, and `consent=yes` is recorded per the collection brief; neither label provenance nor consent scope can be independently verified by the script. The script also reads recognized procedural textures in `data/raw/synthetic` and assigns them to `train` only.

## Label definitions

| Label | Use when |
| --- | --- |
| `genuine_hand_dyed` | A maker or experienced trader confirms the specific piece was made by a hand-dye/resist process. Record the basis and source of confirmation. |
| `factory_print` | The specific piece is confirmed to be factory-printed. If the piece is simply an Ankara/wax print and was not represented as Adire, describe that distinction rather than calling it counterfeit. |
| `uncertain` | Process or provenance is not confirmed, the image is ambiguous, or the available view is inadequate. Exclude from binary training and held-out metrics unless a separate task is defined. |

Seller terms such as "authentic", "handmade", or "real wax" are claims to review, not ground truth. Historical museum examples and online catalogues also need source-specific interpretation.

## Physical-piece identity and views

Use one stable `piece_id` for a physical textile. Give each photograph its own filename and `view_tag` (for example `front`, `back`, `macro_resist`, `macro_bleed`, `macro_join`, or `drape`), but keep every view of the same cloth under the same piece ID and in the same data split.

The auto-confirmed Osun ingestion currently derives IDs from each filename (`OSN-GEN-*` / `OSN-PRT-*`). If multiple files show the same cloth, reconcile them to a shared physical-piece ID in `piece_groups_review.csv` and rebuild splits before evaluation. Until then, a photo-level split can leak the same textile into train and test.

Suggested metadata:

| Field | Meaning |
| --- | --- |
| `piece_id` | Stable, non-identifying ID for the physical cloth |
| `label` | `genuine_hand_dyed`, `factory_print`, or `uncertain` |
| `label_source` | Maker, trader, field collection, open collection, or synthetic source |
| `seller_label` | Seller/catalog description, kept distinct from verified label |
| `source_url` | Original public record or listing, where applicable |
| `adire_type` | Technique/type if confirmed; otherwise `unknown` |
| `market` | Broad market/collection site or coded site; do not expose a private address. For current workshop rows, this remains `osun_workshop` as collection context; `osun_genuine` is the label source and folder name. |
| `consent` | Permission status and scope, with the supporting record stored securely |
| `view_tag` | Front, back, macro, or other capture view |
| `filename` | Repository-relative image path |
| `license_or_tos_note` | Item-level reuse terms, attribution, and permission details |
| `image_phash` | Perceptual hash used for duplicate review |

`splits.csv` should have one row per physical `piece_id` and a `train`, `val`, or `test` assignment.

## Capture protocol

For each consented cloth, aim to capture:

1. The front and reverse side.
2. Close-ups of a resist edge, a crack/bleed feature, and a repeat join when visible.
3. More than one lighting condition and, when feasible, more than one phone model.
4. A consistent cloth crop with minimal background; keep an uncropped original when permission allows.

Record capture conditions such as phone, lighting, date, and view. Do not let labels correlate perfectly with phone, background, or a single lighting setup; otherwise a model may learn the collection setup instead of textile cues.

## Consent, privacy, and reuse

Obtain permission before photographing. Explain the research/demo purpose and ask separately about:

- storing and processing the image;
- using it to train or evaluate a model;
- displaying it in a demo, report, or presentation;
- public attribution, artisan/workshop naming, or a passport page;
- redistribution of the raw photo or a derived model.

Permission for one use does not imply permission for the others. Record who gave permission, when, the agreed scope, and any limits. Allow withdrawal through the agreed contact process. Avoid faces, children, phone numbers, and sensitive location details unless specifically necessary and consented to. Do not upload consented workshop images to third-party services without approval.

For web or marketplace images, record source URL, author/seller, item-level license or written permission, access date, and attribution requirements. Site access or a public post does not by itself grant training or redistribution rights. Do not scrape Instagram, Jumia, Etsy, AliExpress, Alibaba, or Pinterest contrary to their terms. Use Instagram as an outreach channel for direct, permissioned contributions, not as an assumed image license.

## Data handling cautions

- Keep consent records and identifying details separate from public IDs.
- Review image metadata for embedded location or other personal information before sharing.
- Keep raw source files unchanged where possible; use documented prepared copies for model input.
- Do not redistribute museum, marketplace, or field photos unless the specific rights allow it.
- Keep `license_or_tos_note` accurate: a script-generated `consent=yes` or a seller label is not a substitute for an actual consent/reuse record.
