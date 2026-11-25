> Copied from the research repo into `adiretrust-app`. Still accurate: there is no trained AdireTrust model or measured accuracy in this repository.

# Small-data model methodology

## Research question and limits

Test whether photos of confirmed hand-dyed Adire can be distinguished from confirmed factory-printed lookalikes under a defined capture protocol. The output is a research/demo estimate, not proof of manufacturing process or a universal authenticity certification. A cloth that is out of distribution or poorly photographed should be allowed to receive an `uncertain`/abstain result.

The current local manifest contains 81 accepted genuine-folder images and 100 accepted print-folder images, plus 16 Commons records and 24 synthetic images. Two genuine-folder near-duplicates were dropped. The workshop records use provisional one-image-per-piece IDs because multi-view physical-piece relationships have not been reviewed. A stratified split of these IDs is useful for probing code and features, but is not yet a trustworthy physical-piece benchmark. The current trained probe and measured evaluation are recorded in [`../model/EVAL.md`](../model/EVAL.md); treat those results as preliminary, not as a general accuracy claim.

## Plausible visual hypotheses

Have a maker/trader help define and review observable cues:

- dye bleed and edge softness around resist boundaries;
- irregularity in resist lines, ties, cracks, or starch/wax marks;
- whether the reverse side shows dye penetration;
- periodicity and repeat consistency across motif joins;
- differences between a full-cloth view and close-up texture.

These are hypotheses, not rules. Factory prints may imitate some cues, and hand-made techniques/styles vary. Do not label a cloth from visual appearance alone when process provenance is available.

## Recommended sequence

### 1. Audit data before training

- Confirm labels with the maker or an experienced trader and keep unverified records `uncertain`.
- Reconcile all views to one ID per physical piece.
- Inspect duplicates and grouped split assignments.
- Tabulate counts by class, physical piece, collection/source, view, phone, and lighting.
- Check that data splits and capture conditions do not expose obvious class shortcuts.

### 2. Establish a modest real-data baseline

Use a pretrained vision encoder as a frozen feature extractor. Start with one strong image backbone (DINOv2 is the recommended first experiment in the research plan) and a regularized linear classifier. Compare a second encoder only if time/data permit. A nearest-neighbor/prototype baseline can help inspect similarity, but its result means similarity to the observed collection, not authenticity.

Do not train a CNN from scratch. Do not fine-tune the entire backbone on a handful of pieces. Keep class imbalance visible; class weights do not compensate for missing variety in the print class.

### 3. Add optional, clearly separated data

- Synthetic procedural images may help exercise the pipeline or provide a limited training augmentation. Keep them out of validation and test.
- General texture datasets (such as DTD or AITEX) do not provide Adire authenticity labels. Use them only for a stated texture/pretraining experiment, not as genuine-vs-print ground truth.
- Batik examples are a related domain but differ in technique and appearance. Use only items whose labels and rights match the experiment.
- Do not let a model exploit generator artifacts or web-source/capture differences. Compare any synthetic-assisted run against the same held-out real pieces.

### 4. Validate before considering fine-tuning

If a frozen-feature probe is useful and there are enough independent confirmed pieces, fine-tune only the last block(s) with a small learning rate and early stopping on a piece-grouped validation set. Augment only training images (small crops/rotations, blur, and lighting/color changes consistent with capture). Avoid transformations that remove or invent the cue being studied.

## Split and evaluation design

- The split unit is the physical `piece_id`, never a photo, crop, or view.
- Keep front/back/macros from one piece together. Deduplicate before splitting and inspect near-duplicate clusters.
- The current auto-generated Osun IDs are provisional and distinct per image. Do not interpret current split metrics as physical-piece held-out performance until related views are manually grouped.
- Use real photos only in validation and test. Keep test pieces untouched while selecting models and thresholds.
- A held-out stall/market or collection source is a stronger test of generalization than a random split. With the current single workshop collection, this stronger claim is not yet supported.
- If only a few real print pieces exist, show per-piece predictions and error counts. Do not imply that a tiny test set estimates deployment performance.

Report, at minimum:

- counts of physical pieces and images per split and per class;
- the collection/source and split rule;
- precision and recall for both genuine and print, confusion matrix, and false-genuine count;
- ROC-AUC only when the test set has both classes and enough independent pieces to make it meaningful;
- coverage/abstention rate at the chosen threshold and representative failure cases.

Set the threshold on validation data to prioritize avoiding false `genuine` predictions on prints. Do not tune on test. An explicit "cannot tell; show the back or a closer view" is safer than overconfident output.

## Multi-view and cue studies

Start with separate evaluations of full-front, reverse, and macro views, keeping pieces grouped. Then test a simple aggregation of front/back/macro scores if the capture protocol can reliably collect all views. Do not hard-code a pale-back veto until it is validated across confirmed techniques and real prints.

Use Grad-CAM, attention, or patch-similarity maps only as inspection aids. A heatmap does not prove that the model used dye bleed or resist irregularity. Check visually whether maps focus on cloth rather than background, borders, folds, or lighting. Use controlled view/crop ablations and human-reviewed examples to test the cue hypothesis.

## Experiment log

For every run, record the date, code/config, encoder and checkpoint source, training data/sources, whether synthetic data was used, physical-piece counts, split IDs/rule, metrics, threshold, and error notes. Never report a benchmark result as an AdireTrust result unless it was measured on the described held-out real pieces.
