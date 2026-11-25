# AdireTrust probe evaluation

Generated (UTC): 2026-11-25T11:24:17Z

Default experiment: **frozen DINOv2 ViT-S/14 + logistic regression**.
Metrics are computed from this run. This is not a certification result. Do not invent or overwrite these numbers.

## Data

- Manifest labels: 221 rows; split rows: 205
- Resolved image files: 204; missing files: 1
- Missing by source: `{'osun_artisan_workshop': 1}`
- Usable (found + split, synthetics train-only): 204
- Usable by split: `{'train': 151, 'test': 27, 'val': 26}`
- Label counts by split: `{'train': {'genuine_hand_dyed': 65, 'factory_print': 86}, 'val': {'genuine_hand_dyed': 12, 'factory_print': 14}, 'test': {'genuine_hand_dyed': 12, 'factory_print': 15}}`

The public repo includes 81 Osun genuine photos and 24 train-only synthetics.
The 100 Osun print photos listed in the manifest were not in the public source git history.
Wikimedia Commons rows were unsplit and were not used.
Current `piece_id` values are provisional (one image = one id).

## Thresholds

- App default (starting point): **0.6**
- Chosen on val (min false-genuine, then max genuine precision, then coverage): **0.5**

The threshold is never selected on test. Test numbers below apply the val-chosen value and, separately, 0.6.

## Val threshold sweep

| threshold | coverage | P genuine | R genuine | P print | R print | false-genuine |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.50 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.55 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.60 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.65 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.70 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.75 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |
| 0.80 | 0.962 | 1.000 | 1.000 | 1.000 | 1.000 | 0 |

### Val at app default 0.6

- n = 26; class counts = `{'genuine_hand_dyed': 12, 'factory_print': 14}`
- threshold = 0.6
- coverage = 0.962; abstain rate = 0.038; uncertain = 1
- precision / recall on genuine: 1.000 / 1.000
- precision / recall on factory print: 1.000 / 1.000
- false-genuine count (all rows) = 0; among decided = 0
- confusion matrix labels = `['factory_print', 'genuine_hand_dyed']`
- confusion matrix = `[[13, 0], [0, 12]]`
- ROC-AUC (genuine vs rest, scored without abstain) = 1.000

### Test at app default 0.6

- n = 27; class counts = `{'genuine_hand_dyed': 12, 'factory_print': 15}`
- threshold = 0.6
- coverage = 1.000; abstain rate = 0.000; uncertain = 0
- precision / recall on genuine: 1.000 / 1.000
- precision / recall on factory print: 1.000 / 1.000
- false-genuine count (all rows) = 0; among decided = 0
- confusion matrix labels = `['factory_print', 'genuine_hand_dyed']`
- confusion matrix = `[[15, 0], [0, 12]]`
- ROC-AUC (genuine vs rest, scored without abstain) = 1.000

### Val at chosen threshold 0.5

- n = 26; class counts = `{'genuine_hand_dyed': 12, 'factory_print': 14}`
- threshold = 0.5
- coverage = 1.000; abstain rate = 0.000; uncertain = 0
- precision / recall on genuine: 1.000 / 1.000
- precision / recall on factory print: 1.000 / 1.000
- false-genuine count (all rows) = 0; among decided = 0
- confusion matrix labels = `['factory_print', 'genuine_hand_dyed']`
- confusion matrix = `[[14, 0], [0, 12]]`
- ROC-AUC (genuine vs rest, scored without abstain) = 1.000

### Test at chosen threshold 0.5 (applied, not retuned)

- n = 27; class counts = `{'genuine_hand_dyed': 12, 'factory_print': 15}`
- threshold = 0.5
- coverage = 1.000; abstain rate = 0.000; uncertain = 0
- precision / recall on genuine: 1.000 / 1.000
- precision / recall on factory print: 1.000 / 1.000
- false-genuine count (all rows) = 0; among decided = 0
- confusion matrix labels = `['factory_print', 'genuine_hand_dyed']`
- confusion matrix = `[[15, 0], [0, 12]]`
- ROC-AUC (genuine vs rest, scored without abstain) = 1.000

## Export

- Probe saved: True
- `model/weights/dinov2_vits14_logreg.joblib`
- `model/weights/label_map.json`

## Optional flags used in this session

- RUN_KNN = False
- RUN_SIGLIP_EFFICIENTNET = False
- RUN_DINOV2_VITB_PATCH = False
- RUN_ZEROSHOT = False
- RUN_STAGE2 = False
- RUN_FINETUNE = False
- RUN_HEATMAP = False
- RUN_MULTISHOT = False

Optional-cell metrics are printed in the notebook when a flag is on; re-run this cell afterwards if you want them copied here by hand.

