#!/usr/bin/env python3
"""Skeleton for a frozen DINOv2 ViT-S/14 linear probe.

Importing this module does not import torch. Training dependencies are only
loaded inside train() so the API image can stay small.
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path


LABELS = ("genuine_hand_dyed", "factory_print")
BACKBONE_HINT = "vit_small_patch14_dinov2.lvd142m"


def load_manifest(data_dir: Path) -> tuple[list[dict[str, str]], dict[str, str]]:
    labels_path = data_dir / "labels" / "labels.csv"
    splits_path = data_dir / "labels" / "splits.csv"
    with labels_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    with splits_path.open(newline="", encoding="utf-8") as handle:
        splits = {row["piece_id"]: row["split"] for row in csv.DictReader(handle)}
    return rows, splits


def resolve_image(row: dict[str, str], image_root: Path | None, data_dir: Path) -> Path | None:
    relative = Path(row["filename"].replace("\\", "/"))
    repo_root = data_dir.parent
    candidates = [repo_root / relative]
    if image_root is not None:
        candidates.append(image_root / relative.name)
    try:
        candidates.append(data_dir / relative.relative_to("data"))
    except ValueError:
        candidates.append(data_dir / relative)
    for path in candidates:
        if path.is_file():
            return path
    return None


def iter_examples(
    data_dir: Path,
    image_root: Path | None,
    include_synthetic_in_train: bool = True,
) -> tuple[list[dict[str, str]], dict[str, int]]:
    rows, splits = load_manifest(data_dir)
    examples: list[dict[str, str]] = []
    skipped = {"commons": 0, "unsplit": 0, "missing": 0, "uncertain": 0}
    for row in rows:
        source = row.get("label_source", "")
        if source == "wikimedia_commons":
            skipped["commons"] += 1
            continue
        split = splits.get(row["piece_id"])
        if not split:
            skipped["unsplit"] += 1
            continue
        if source == "synthetic" and split != "train":
            # Safety: synthetics must never evaluate the model.
            continue
        if source == "synthetic" and not include_synthetic_in_train:
            continue
        if row.get("label") not in LABELS:
            skipped["uncertain"] += 1
            continue
        path = resolve_image(row, image_root, data_dir)
        if path is None:
            skipped["missing"] += 1
            continue
        examples.append(
            {
                "piece_id": row["piece_id"],
                "label": row["label"],
                "split": split,
                "source": source,
                "path": str(path),
            }
        )
    return examples, skipped


def summarize(examples: list[dict[str, str]], skipped: dict[str, int]) -> None:
    from collections import Counter

    print("AdireTrust DINOv2 probe skeleton")
    print(f"Usable labeled images found: {len(examples)}")
    print(f"By split: {dict(Counter(item['split'] for item in examples))}")
    print(f"By label: {dict(Counter(item['label'] for item in examples))}")
    print(f"By source: {dict(Counter(item['source'] for item in examples))}")
    print(f"Skipped: {skipped}")
    missing = skipped.get("missing", 0)
    if missing:
        print(
            f"WARNING: {missing} manifest rows have no image file. "
            "The 100 Osun print photos were not in the public source repo. "
            "Do not invent results or fill this gap with unmatched web images."
        )


def train(args: argparse.Namespace) -> int:
    data_dir = Path(args.data_dir).resolve()
    image_root = Path(args.image_root).resolve() if args.image_root else None
    examples, skipped = iter_examples(data_dir, image_root)
    summarize(examples, skipped)

    if args.dry_run:
        print("Dry run only. Planned backbone:", BACKBONE_HINT)
        print(
            "Next steps: extract frozen DINOv2 ViT-S/14 embeddings, fit a "
            "linear probe on train, tune the abstain threshold on val, "
            "and report precision-on-genuine without inventing scores."
        )
        return 0

    try:
        import torch  # noqa: F401
        import timm  # noqa: F401
    except ImportError:
        print(
            "torch and timm are required for training. "
            "Install model/requirements-train.txt, or pass --dry-run.",
            file=sys.stderr,
        )
        return 2

    print(
        "Training loop is not implemented in this skeleton. "
        f"Load frozen {BACKBONE_HINT}, pool embeddings, fit logistic regression "
        "or a linear head, save weights under model/checkpoints/, and keep "
        "synthetic images out of val/test."
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Train or inspect the DINOv2 linear probe.")
    parser.add_argument("--data-dir", type=Path, default=Path("data"))
    parser.add_argument(
        "--image-root",
        type=Path,
        default=None,
        help="Optional directory of pre-resized images (e.g. data/processed/osun_workshop/224).",
    )
    parser.add_argument("--dry-run", action="store_true", help="List usable rows; do not import torch.")
    parser.add_argument("--output-dir", type=Path, default=Path("model/checkpoints"))
    return parser


def main() -> int:
    return train(build_parser().parse_args())


if __name__ == "__main__":
    raise SystemExit(main())
