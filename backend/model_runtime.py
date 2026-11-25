"""Lazy DINOv2 probe loader and CPU inference helpers.

Torch is imported only when an exported probe is present and the runtime loads it.
"""

from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path
from typing import Any

from PIL import Image


MODEL_VERSION = "dinov2_vits14_logreg"
PROBE_FILENAME = f"{MODEL_VERSION}.joblib"
LABELS_FILENAME = "label_map.json"
EXPECTED_BACKBONE = "dinov2_vits14"
EXPECTED_CLASSES = {"genuine_hand_dyed", "factory_print"}


class ModelRuntime:
    def __init__(
        self,
        *,
        backbone: Any,
        probe: Any,
        classes: list[str],
        image_size: int,
        mean: list[float],
        std: list[float],
        torch_module: Any,
        numpy_module: Any,
    ) -> None:
        self.backbone = backbone
        self.probe = probe
        self.classes = classes
        self.image_size = image_size
        self.mean = mean
        self.std = std
        self.torch = torch_module
        self.numpy = numpy_module

    @classmethod
    def load(cls, model_dir: Path) -> "ModelRuntime":
        probe_path = model_dir / PROBE_FILENAME
        label_map_path = model_dir / LABELS_FILENAME
        missing = [path.name for path in (probe_path, label_map_path) if not path.is_file()]
        if missing:
            raise FileNotFoundError(f"Missing model artifacts: {', '.join(missing)}")

        # Keep heavy ML dependencies out of API import and the no-model path.
        import joblib
        import numpy as np
        import torch

        bundle = joblib.load(probe_path)
        label_map = json.loads(label_map_path.read_text(encoding="utf-8"))
        probe = bundle.get("probe")
        classes = [str(label) for label in bundle.get("classes", [])]
        map_classes = [str(label) for label in label_map.get("classes", [])]
        if probe is None or classes != map_classes or set(classes) != EXPECTED_CLASSES:
            raise ValueError("Probe and label map do not contain the expected two classes.")
        if bundle.get("backbone") != EXPECTED_BACKBONE or label_map.get("backbone") != EXPECTED_BACKBONE:
            raise ValueError("Model artifacts do not use the expected DINOv2 ViT-S/14 backbone.")
        if list(probe.classes_) != list(range(len(classes))):
            raise ValueError("Probe class indices do not match the exported label order.")

        image_size = int(bundle.get("image_size", label_map.get("image_size", 224)))
        mean = [float(value) for value in bundle.get("mean", label_map.get("mean", []))]
        std = [float(value) for value in bundle.get("std", label_map.get("std", []))]
        if image_size != 224 or len(mean) != 3 or len(std) != 3 or any(value == 0 for value in std):
            raise ValueError("Model preprocessing metadata is missing or unsupported.")

        backbone = torch.hub.load(
            "facebookresearch/dinov2",
            "dinov2_vits14",
            pretrained=True,
        )
        backbone.eval().to(torch.device("cpu"))
        for parameter in backbone.parameters():
            parameter.requires_grad = False

        feature_dim = int(getattr(probe, "n_features_in_", bundle.get("feature_dim", 0)))
        if feature_dim != 384:
            raise ValueError(f"Expected 384-dimensional DINOv2 features, got {feature_dim}.")

        return cls(
            backbone=backbone,
            probe=probe,
            classes=classes,
            image_size=image_size,
            mean=mean,
            std=std,
            torch_module=torch,
            numpy_module=np,
        )

    def predict(self, image_bytes: bytes) -> dict[str, Any]:
        with Image.open(BytesIO(image_bytes)) as image:
            # Match the training notebook: resize the full image to a square,
            # rather than center-cropping away textile details.
            image = image.convert("RGB").resize(
                (self.image_size, self.image_size),
                Image.Resampling.BICUBIC,
            )
            pixels = self.numpy.asarray(image, dtype=self.numpy.float32) / 255.0

        tensor = self.torch.from_numpy(pixels).permute(2, 0, 1)
        mean = self.torch.tensor(self.mean, dtype=tensor.dtype)[:, None, None]
        std = self.torch.tensor(self.std, dtype=tensor.dtype)[:, None, None]
        batch = ((tensor - mean) / std).unsqueeze(0).to(self.torch.device("cpu"))

        with self.torch.inference_mode():
            features = self.backbone(batch)
            if isinstance(features, dict):
                features = features.get("x_norm_clstoken", next(iter(features.values())))
            if isinstance(features, (tuple, list)):
                features = features[0]
            feature_array = features.detach().cpu().numpy()

        if feature_array.ndim != 2 or feature_array.shape[1] != 384:
            raise ValueError("DINOv2 returned features with an unexpected shape.")

        probabilities = self.probe.predict_proba(feature_array)[0]
        class_probabilities = {
            label: float(probabilities[index])
            for index, label in enumerate(self.classes)
        }
        predicted_label = max(class_probabilities, key=class_probabilities.get)
        return {
            "predicted_label": predicted_label,
            "confidence": class_probabilities[predicted_label],
            "class_probabilities": class_probabilities,
            "model_version": MODEL_VERSION,
        }
