> Copied from [drizzy765/AdireTrust](https://github.com/drizzy765/AdireTrust/blob/main/docs/research-plan.md). This is the repo form of the pretraining / engineering plan (also in the Notion page [AdireTrust — Hackathon Prep Plan](https://app.notion.com/p/4199e1028e8581b4a2a6f210c2a32cf8), and in `adiretrust.md` / `adiretrust.pdf` in that research repo). Section 6–7 plus the Notion “8. Training Plan: Staged Transfer Learning” are the source of truth for Colab training. There is still no trained AdireTrust accuracy result in this repository.

# AdireTrust research plan

> Structured Markdown conversion and update of [`adiretrust.pdf`](../adiretrust.pdf). The original PDF is retained. The November 15-25, 2026 board is time-bound and has passed; do not treat it as an evergreen schedule. Current-data notes reflect the local manifest snapshot and should be refreshed when the dataset changes.

## 1. Project and research question

AdireTrust explores a phone-camera aid for distinguishing hand-dyed Abeokuta Adire from factory-printed lookalikes, with a possible QR passport for consented artisan pieces and a WhatsApp/laptop demo path.

The research question is narrower than proving authenticity: **under a documented capture protocol, do visual features help distinguish confirmed hand-dyed pieces from confirmed factory prints?** A photo cannot establish the production process by itself. The model must be allowed to abstain, and all performance claims must state the data and split behind them.

### Cues to investigate

The plan proposes cues that makers and traders inspect:

- dye bleed and edge softness around resist boundaries;
- irregular resist lines, wax/starch cracks, and tied areas;
- the reverse side and evidence of dye soak-through;
- regularity of repeated motifs and whether deviations recur in the same locations;
- macro texture and the joins between repeated motifs.

These are hypotheses, not universal rules. Machine prints can imitate visual texture, and real Adire techniques and styles vary.

## 2. Context and claims

The source plan attributes the following reported claims to their outlets/speakers; they are not independent measurements by this project:

| Reported claim | Attribution in the source plan |
| --- | --- |
| Adejoke Somoye estimated that 80% of Adire sold in Nigerian markets was made in China and that 50-70 women and youths in production/marketing lose jobs every three weeks. | Punch, January 18, 2025 |
| A Chinese-made piece was reported at N3,300, about half the price of locally produced fabric; Abeokuta was reported to have nearly 2,000 merchants and producers. | AFP / France 24, June 12, 2024 |
| A committee was set up to address Chinese Adire in Itoku and Asero; Itoku was described as the craft's starting place. | Tribune, November 22, 2023; Alake of Egbaland and Giwa Obinrin statements as reported |
| Kemta Adire Market is in the Itoku area; the craft's origin was traced to Jojolola's compound in Kemta, with more than 1,500 women directly involved in production/marketing. | Daily Trust, March 8, 2024 |

Use "reported", "estimated", and "according to" in public materials. Do not present these claims as AdireTrust measurements.

## 3. Current data and collection plan

### Current repository snapshot

- 81 accepted images from the `osun_genuine` folder and 100 from `osun_prints` are included as workshop records. Two near-duplicate genuine files were excluded; no corrupt files were found.
- The local manifest has 221 rows: 99 `genuine_hand_dyed`, 116 `factory_print`, and 6 `uncertain`; sources are 181 Osun workshop, 16 Wikimedia Commons, and 24 synthetic records.
- `splits.csv` assigns the 181 workshop records and 24 synthetic records; Commons records remain unsplit pending review. All synthetic records are assigned to `train`.
- Workshop IDs are currently provisional one-image-per-piece IDs because the filenames do not establish which photos show the same physical cloth. The resulting 70/15/15 stratification is not a verified physical-piece or market-held-out benchmark.
- The Osun labels and consent flags are supplied from the folder/collection brief; the ingestion script cannot independently verify the production process or consent scope.
- No trained model or measured genuine-vs-print evaluation is currently checked in.

Update these statements and counts from the local `data/labels/labels.csv` whenever data changes. The raw workshop photos and metadata remain local collection data; see [data collection, labels, and consent](./data-and-consent.md).

### Collection priorities

1. Reconcile related workshop photos to stable physical-piece IDs and confirm the exact scope of permission for storage, training, and demo use.
2. Keep the 100 print-folder examples grouped and labeled as specific physical cloths. Record who confirmed the process and whether each piece was represented/sold as Adire; do not equate every African wax print with a counterfeit.
3. Collect fronts, backs, and macros of relevant edges/cracks/repeat joins. Vary phones and lighting where possible.
4. Prefer a second market/stall group as a future held-out evaluation source. The Osun workshop set alone cannot establish generalization to Itoku/Kemta/Asero.
5. Keep uncertain items separate until a maker/trader can confirm them.

The original target was approximately 300 confirmed pieces, balanced across genuine and print, with 30-50 pieces per class as a minimum viability goal. Treat these as planning targets, not prerequisites for a careful prototype. A smaller, well-labeled and diverse set is better than a larger set of guesses.

### Public datasets reviewed

| Dataset/source | What it contains | Appropriate use and caveat |
| --- | --- | --- |
| Wax-MNIST | About 1,081 low-resolution African wax images across eight brands/types. | Texture warm-up only; brand/type labels are not authenticity labels. Check license before sharing. |
| African Attire Images | Traditional clothing/style classes, including an Adire class. | Explore broad appearance only. An Adire clothing class does not mean hand-dyed. Web-source/copyright caution. |
| Indonesian Batik / BatikSnap | Batik motif labels; cleaned dataset described in the source plan as Apache 2.0. | Related resist-dye texture or motif experiments, not Adire authenticity ground truth. |
| Describable Textures Dataset (DTD) | 5,640 images in 47 texture categories. | General texture representation/probing; not textile process labels. |
| TILDA Textile Texture Database | 3,200 grayscale textile images with textile/defect categories. | Texture/defect methods; dated industrial data, not hand-dyed-vs-print. |
| AITEX Fabric Image Database | 245 industrial fabric images across seven fabrics, with defect masks. | Defect/texture practice only. |
| MVTec AD; DAGM; IndustrialTextileDataset | Industrial anomaly/defect imagery and protocols. | Method references for anomaly detection; domain differs from Adire and counterfeits. |
| Yoruba Motifs Project (Roboflow) | About 61 images for object/motif labels. | Tiny motif reference, not suitable authenticity training data. |
| Adire defect studies | The source plan describes an Itoku phone-photo study with 234 Adire images augmented to 884 for stains/tears/color-smear defect detection. | Relevant local imaging context, but the label task is defects, not genuine vs factory print; files were not found publicly in the research pass. |

No public dataset identified in the source plan labels Abeokuta Adire as confirmed hand-dyed versus factory print.

## 4. Sources and label reliability

Source names below are research leads captured in the original plan, not automatic labels or permission to download/train. Verify each physical item and each license. The source plan recommends against scraping Instagram, Jumia, Etsy, AliExpress, Alibaba, or Pinterest in violation of terms.

### Likely genuine or process-reference leads

| Source | Use / caveat from the research plan |
| --- | --- |
| Sokofa - Hand Dyed Adire Fabric | Seller-listed hand-dyed, Abeokuta South; medium-high seller claim, but inspect the specific item and rights. |
| Adire Abeokuta marketplace; Olokun Adire House | Mixed catalogue; the same marketplace may list modern prints. Verify item by item. |
| Cynosureark | Mixed tie-dye, batik, Kampala, and Ankara catalogue near Itoku; verify each product. |
| Adirelounge (Instagram) | Possible designer hand-process lead; verify the specific SKU and request permission. Do not scrape the profile. |
| Fabrikraft; Hof Jedidiah | Nigerian handmade/batik/adire claims; useful leads, not an Abeokuta field substitute and not ground truth without item-level review. |
| V&A Adire cloth record (CIRC.592-1965); British Museum Adire records; Minneapolis Institute of Art Adire wrapper | Historical process references. Museum image rights and style differences apply; check the object-level reuse terms. |
| Adire African Textiles - "Adire Cloth of the Yorubas" | Technique/history reference; ask before using gallery images. |

### Print/negative leads

| Source | Interpretation |
| --- | --- |
| AliExpress Ankara/African wax and Alibaba African-print searches | Potential factory-print negatives, but not necessarily Chinese-made Adire copies. Titles and seller descriptions are not verification. Avoid scraping; obtain permission or photograph market cloth. |
| Jumia Premium African Wax Print Ankara | A clear print lead according to the source plan, but not automatically a counterfeit Adire unless represented that way. Respect terms and image rights. |
| Jumia Adire catalogue and Etsy Adire searches | Mixed listings; hunt leads only. Human verification and permission are required. |

### Context-only sources and open collections

Market-tour videos can document stall lighting/context but cloths in the background are unlabeled and must not be weakly labeled. The source plan lists Rosemary Jus, Financial Fooby, OSM Atelier, and a Daily Trust "How to Make Popular African Traditional Textile: Adire" process video. Ask for permission before extracting training stills.

Wikimedia Commons and Flickr CC images require item-level license/attribution review and cloth-content review. A Creative Commons license does not establish process labels. Pinterest is a hunt list only, not a training source.

## 5. Prior work and what it supports

The related work in the source plan is mostly batik or texture research, not validated Adire authentication:

| Work | Summary and relevance |
| --- | --- |
| Rasyidi, Handayani, Aziz, "Identification of batik making method from images using convolutional neural network with limited amount of data," BEEI, 2021 | The plan reports 120 images across tulis/cap/print classes; transfer learning, five-fold CV, and patch-based experiments. It reports 79.17% DenseNet169 accuracy on full images and 87.61% VGG13_bn on patches. Batik analog only; not an AdireTrust result. |
| Widyantoko, Widowati, Isnaini, Trapsiladi, "Expert role in image classification using CNN for hard to identify object: distinguishing batik and its imitation," IJ-AI, 2021 | Compared imitation types and capture conditions; expert-guided photos performed better. Supports designing capture protocol as part of the system. |
| Meranggi et al., "Batik Classification Using Convolutional Neural Network with Data Improvements," JOIV | Batik motif classification, not authenticity. The reported patched-set result is not an Adire authenticity score. |
| Ogunleye et al., Adire defect detection with GLCM + SVM (SBOA-SVM), LAUTECH Journal, 2025 | Local Adire phone imagery, but labels are defect/normal rather than genuine/print. |
| Cimpoi et al., "Describing Textures in the Wild," CVPR 2014 | General texture representation background; DTD is not Adire authenticity data. |
| Selvaraju et al., Grad-CAM, 2017 | Heatmap method for CNN inspection, not proof of causal reasoning. |

These reported results motivate experiments; they do not establish expected AdireTrust accuracy.

## 6. Recommended ML methodology

The current recommended workflow is in [model methodology](./model-methodology.md). In brief:

1. Audit physical-piece IDs, confirmed labels, duplicates, permission, and capture variation.
2. Start with a frozen pretrained encoder and a simple linear probe or nearest-neighbor baseline. Do not train from scratch.
3. Compare only a small number of encoders. DINOv2 is the first proposed texture baseline; SigLIP/CLIP can be a zero-shot comparison, not the source of truth.
4. Use synthetic data, if at all, in training only; evaluate exclusively on real cloth.
5. Fine-tune lightly only if the real-data probe is useful and enough independent examples exist.
6. Split all views by physical piece; hold out a market/stall/source for a stronger test when available.
7. Prefer high precision for genuine predictions, report print false-accepts, and provide an abstain option.
8. Treat Grad-CAM/attention as inspection aids; use controlled full/front/back/macro comparisons to test cue hypotheses.

## 7. Experiments and reporting

Original experiment order:

1. Fixed zero-shot CLIP/SigLIP prompts; optionally one VLM pass on a fixed preview set.
2. Frozen-feature linear probe or k-NN on real field pieces, comparing DINOv2/SigLIP and optionally a frozen EfficientNet.
3. Lightly fine-tune only the most promising baseline.
4. Ablate front-only vs front+back, full cloth vs macros, and one phone vs mixed phones.

For every run, record model/checkpoint, source and class counts, piece/image counts, whether synthetic images were used, split rule, metrics, threshold, and failures. Report precision/recall for both classes, confusion matrix, false-genuine count, and coverage/abstention. ROC-AUC is only meaningful when the held-out set has both classes and enough independent pieces.

Do not tune the threshold on the test set. Do not split crops or multiple views of a piece across splits. With a handful of real prints, show per-piece predictions and call results preliminary.

## 8. Product/demo concept

The original demo path:

1. User photographs the front, back, and a macro.
2. The system returns a label, confidence, and short reason or abstain instruction.
3. A heatmap/patch view may help inspect the result.
4. A QR passport can link a consented piece to an artisan/workshop using a public ID, not a phone number.
5. A WhatsApp flow is optional; a local laptop demo is the fallback.

The PDF proposed a small FastAPI-like service (`POST /check` and `GET /passport/{id}`), SQLite, and a local/offline demo path. These components are proposal, not current repository implementations. Never put artisan PII on a QR card without specific consent. Do not invent heatmaps or accuracy figures.

## 9. Risks and safeguards

| Risk | Safeguard |
| --- | --- |
| Too few or unbalanced real pieces | Prefer a smaller confirmed set; say the sample size and shortfall. Collect real prints and more process diversity. |
| Prints mimic bleed/crackle | Capture macro repeat joins and include hard negatives in an untouched real test set. |
| Lighting/phone shortcuts | Vary phones/light; keep pieces grouped; test a held-out source when possible. |
| Labels inferred from a rushed photo or seller copy | Use maker/trader confirmation; keep uncertain records out of binary evaluation. |
| A picture may be insufficient | Make front/back/macro capture part of the product and allow abstention. |
| Copyright, consent, or privacy | Obtain item-level permission, avoid faces/PII, honor terms, and do not scrape restricted sources. |
| WhatsApp approval or venue network delays | Keep a laptop/local offline fallback. |
| Overclaiming | State source, n pieces/images, split rule, errors, and limitations; attribute public claims. |

## 10. Dated November 15-25, 2026 board

This is a compact conversion of the source PDF's dated hackathon board. Dates through November 22 are past; November 23-25 are the remaining event-preparation dates as of the plan's preparation context.

| Date | ML/research track | Collection/product track |
| --- | --- | --- |
| Nov 15-16 | Create schema, consent/capture protocol, frozen-feature notebook, and decide probe vs fine-tune path. | Contact market leads, consent/labeling setup, passport sketch, and `/check`/messaging test stub. |
| Nov 17-18 | Ingest first field photos, check views/quality, split by piece, and run initial frozen-feature probe. | Itoku then Kemta/second stall collection, label with maker/trader input, back up photos. |
| Nov 19-20 | Review errors, consider light fine-tuning only if probe warrants it, choose threshold, test front/back. | Integrate inference, prepare consented passports and laptop/WhatsApp path. |
| Nov 21-22 | Evaluate held-out pieces/source, review failure cases, prepare honest metrics and offline backup. | Rehearse end-to-end demo and prepare presentation/backup photos. |
| Nov 23-25 | Lock a demo model, test one genuine/one print/one uncertain, and record a backup. | Final rehearsal, offline booth path, hardware and QR preparation. |

## 11. Pitch and public communication

Lead with artisans and the local context, not the model. Explain why front/back/macros may help, show both a successful and a hard case if available, and state that this is a locally collected prototype under evaluation. Invite traders, makers, and local institutions to help develop a permissioned dataset.

Never claim a solved authenticity standard, quote unmeasured accuracy, display a fabricated heatmap, or name an artisan without consent.

## 12. Source links retained from the original plan

These are the URLs embedded in the PDF at the time it was prepared. They are research references and leads, not a guarantee that a page is still available, that a label is correct, or that an image can be reused. Re-check current terms, rights, and factual claims before collection or publication.

### Context and reporting

- [Ogun Digital Summit hackathon](https://www.ogundigitalsummit.com/hackathon)
- [Jakarta Post: Three ways to identify quality batik](https://www.thejakartapost.com/life/2018/01/26/three-ways-to-identify-quality-batik)
- [How to tell handmade Kelantan batik from printed fabric](https://drosebatikdanbutik.com/blog/how-to-tell-handmade-kelantan-batik-from-printed-fabric)
- [Punch: Adire makers decry government inaction as Chinese fakes flood market](https://punchng.com/adire-makers-decry-govt-inaction-as-chinese-fakes-flood-market/)
- [France 24 / AFP: Nigeria's dyed-cloth traders feel heat from China, inflation](https://www.france24.com/en/live-news/20240612-nigeria-s-dyed-cloth-traders-feel-heat-from-china-inflation)
- [Tribune: Alake constitutes committee to tackle influx of China Adire](https://tribuneonlineng.com/alake-constitutes-committee-to-tackle-influx-of-china-adire-in-itoku-asero-markets/)
- [Daily Trust: Adire - how Ogun women preserve handmade fabrics](https://dailytrust.com/adire-how-ogun-women-preserve-handmade-fabrics/)

### Datasets and collection tools

- [Wax-MNIST on Kaggle](https://www.kaggle.com/datasets/soubeiga/wax-mnist) and its [project page](https://armelsoubeiga.github.io/wax-mnist/)
- [African Attire Images on Hugging Face](https://huggingface.co/datasets/inuwamobarak/african-atire) and the [associated project](https://github.com/inuwamobarak/african_attire_detector)
- [Indonesian Batik dataset](https://www.kaggle.com/datasets/fisheightcharacter/indonesian-batik-dataset-enhanced-and-cleaned) and [BatikSnap](https://www.kaggle.com/datasets/syahdanputra/batiksnap-dataset)
- [Describable Textures Dataset](https://www.robots.ox.ac.uk/~vgg/data/dtd/)
- [TILDA Textile Texture Database](https://lmb.informatik.uni-freiburg.de/resources/datasets/tilda.en.html)
- [AITEX Fabric Image Database](https://www.aitex.es/afid/)
- [MVTec AD](https://www.mvtec.com/company/research/datasets/mvtec-ad)
- [DAGM 2007 dataset](https://www.kaggle.com/datasets/mhskjelvareid/dagm-2007-competition-dataset-optical-inspection)
- [IndustrialTextileDataset](https://huggingface.co/datasets/SimTho/IndustrialTextileDataset)
- [Yoruba Motifs Project](https://universe.roboflow.com/davids-workspace-9crwl/yoruba-motifs-project)
- [Adire defect study in LAUTECH Journal](https://www.laujet.com/index.php/laujet/article/view/973); [related JERR write-up](https://doi.org/10.9734/jerr/2026/v28i41865); [older African fabric pattern paper](https://research.ijcaonline.org/volume81/number15/pxc3892481.pdf)
- [Label Studio](https://labelstud.io/) and [Roboflow](https://roboflow.com/) (review data-use terms before uploading consented photos)

### Papers and pretrained model references

- Rasyidi, Handayani, and Aziz, [batik making-method classification with limited data](https://journal.beei.org/index.php/EEI/article/view/3035) ([PDF](https://journal.beei.org/index.php/EEI/article/download/3035/2173))
- Widyantoko et al., [expert role in batik/imitation image classification](https://ijai.iaescore.com/index.php/IJAI/article/view/20787) ([DOI](https://doi.org/10.11591/ijai.v10.i1.pp93-100))
- Meranggi et al., [Batik classification with data improvements](https://www.joiv.org/index.php/joiv/article/view/716/0)
- Selvaraju et al., [Grad-CAM](https://arxiv.org/abs/1610.02391)
- [DINOv2](https://arxiv.org/abs/2304.07193); [SigLIP](https://arxiv.org/abs/2303.15343); [CLIP](https://arxiv.org/abs/2103.00020)
- [EfficientNet](https://arxiv.org/abs/1905.11946); [MobileNetV2](https://arxiv.org/abs/1801.04381); [ConvNeXt](https://arxiv.org/abs/2201.03545); [DINO](https://arxiv.org/abs/2010.11929)

### Product and API references

- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [WhatsApp Cloud API getting started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Original hackathon tracker](https://app.notion.com/p/Ogun-Digital-Summit-Hackathon-4069e1028e8581c48331d998bb6deb31?pvs=21)

### Artisan, retailer, museum, and market leads

- [Sokofa hand-dyed Adire listing](https://sokofa.com/shop/product/hand-dyed-adire-fabric)
- [Adire Abeokuta marketplace](https://www.adireabeokuta.com/); [Cynosureark](https://cynosureark.com/)
- [Adirelounge](https://www.adirelounge.com/) and its [Instagram profile](https://www.instagram.com/adirelounge/) (outreach only; no scraping)
- [Fabrikraft](https://fabrikraft.com.ng/); [Hof Jedidiah](https://hofjedidiah.com/)
- [Jumia Adire catalogue](https://www.jumia.com.ng/mlp-adire/)
- [Etsy hand-dyed Adire Nigeria search](https://www.etsy.com/search?q=hand+dyed+adire+nigeria), [Nigerian Adire](https://www.etsy.com/market/nigerian_adire), and [Adire](https://www.etsy.com/market/adire)
- [V&A Adire article](https://www.vam.ac.uk/articles/adire-tied-and-dyed-indigo-textiles) and [CIRC.592-1965 object record](https://collections.vam.ac.uk/item/O147380/adire-cloth-textile-unknown/)
- [British Museum Adire term](https://www.britishmuseum.org/collection/term/x112724)
- [Minneapolis Institute of Art Adire wrapper](https://collections.artsmia.org/art/128271/adire-wrapper-yoruba-artist)
- [Adire African Textiles: Adire cloth of the Yorubas](https://www.adireafricantextiles.com/textiles-resources-sub-saharan-africa/some-major-west-african-textile-traditions/adire-cloth-of-the-yorubas/)

### Print leads, videos, and image collections

- [AliExpress Ankara](https://www.aliexpress.com/w/wholesale-ankara-fabric.html) and [Adire search](https://www.aliexpress.com/w/wholesale-adire-fabric.html)
- [Alibaba African print](https://www.alibaba.com/trade/search?SearchText=african+print+fabric) and [Adire search](https://www.alibaba.com/trade/search?SearchText=adire+fabric)
- [Jumia premium African wax print listing](https://www.jumia.com.ng/premium-african-wax-print-ankara-fabric-6-yards-teal-green-floral-pattern-420340216.html), [African print catalogue](https://www.jumia.com.ng/catalog/?q=african+print+fabric), and [Adire print catalogue](https://www.jumia.com.ng/catalog/?q=adire+print)
- [Rosemary Jus Abeokuta market video](https://www.youtube.com/watch?v=cOcRf6zrT9Y); [Financial Fooby market video](https://www.youtube.com/watch?v=SoxnJ81e2O8); [OSM Atelier Adire Strip Mall video](https://www.youtube.com/watch?v=e91zb-8SiL8); [Daily Trust Adire process video](https://www.youtube.com/watch?v=M8wGmOBOr4M)
- [Wikimedia Commons Adire category](https://commons.wikimedia.org/wiki/Category:Adire_%28textile_art%29)
- [Flickr CC search: Adire Yoruba](https://www.flickr.com/search/?text=adire%20yoruba&license=2%2C3%2C4%2C5%2C6%2C9) and [Adire](https://www.flickr.com/search/?text=adire)
- [Craft Atlas Adire reference](https://craftatlas.co/crafts/adire)
- [Pinterest Adire design ideas](https://www.pinterest.com/ideas/adire-fabric-designs/922226640219/) and [hand-dyed Adire search](https://www.pinterest.com/search/pins/?q=hand%20dyed%20adire) (discovery only; not a bulk-scraping or training source)

Before sharing this Markdown outside the team, re-check changing license, product, API, and market claims.
