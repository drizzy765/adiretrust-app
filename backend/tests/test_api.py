"""API tests for the stub service. The app must not import torch."""

from __future__ import annotations

import io
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def _tiny_jpeg() -> io.BytesIO:
    buffer = io.BytesIO()
    Image.new("RGB", (32, 32), color=(20, 40, 90)).save(buffer, format="JPEG")
    buffer.seek(0)
    return buffer


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_check_returns_503_without_model(client: TestClient) -> None:
    files = {"image": ("swatch.jpg", _tiny_jpeg(), "image/jpeg")}
    response = client.post("/check", files=files)
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "MODEL_NOT_LOADED"


def test_check_uses_mocked_model(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeModel:
        def predict(self, _image: bytes) -> dict[str, object]:
            return {
                "predicted_label": "genuine_hand_dyed",
                "confidence": 0.82,
                "class_probabilities": {
                    "factory_print": 0.18,
                    "genuine_hand_dyed": 0.82,
                },
                "model_version": "dinov2_vits14_logreg",
            }

    monkeypatch.setattr("main.MODEL_RUNTIME", FakeModel())
    files = {"image": ("swatch.jpg", _tiny_jpeg(), "image/jpeg")}
    response = client.post("/check", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["label"] == "genuine_hand_dyed"
    assert body["verdict"] == "genuine_hand_dyed"
    assert body["confidence"] == 0.82
    assert body["class_probabilities"]["factory_print"] == 0.18
    assert body["model_version"] == "dinov2_vits14_logreg"
    assert "not proof" in body["explanation"]
    assert body["price_guidance"]["status"] == "PLACEHOLDER"


def test_check_abstains_below_threshold(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeModel:
        def predict(self, _image: bytes) -> dict[str, object]:
            return {
                "predicted_label": "genuine_hand_dyed",
                "confidence": 0.55,
                "class_probabilities": {
                    "factory_print": 0.45,
                    "genuine_hand_dyed": 0.55,
                },
                "model_version": "dinov2_vits14_logreg",
            }

    monkeypatch.setattr("main.MODEL_RUNTIME", FakeModel())
    files = {"image": ("swatch.jpg", _tiny_jpeg(), "image/jpeg")}
    response = client.post("/check", files=files)

    assert response.status_code == 200
    assert response.json()["label"] == "uncertain"
    assert response.json()["verdict"] == "uncertain"


def test_check_rejects_non_image(client: TestClient) -> None:
    files = {"image": ("notes.txt", io.BytesIO(b"not an image"), "text/plain")}
    response = client.post("/check", files=files)
    assert response.status_code == 400


def test_sellers_are_placeholders(client: TestClient) -> None:
    response = client.get("/sellers")
    assert response.status_code == 200
    body = response.json()
    sellers = body["sellers"]
    assert len(sellers) == 5
    assert "PLACEHOLDER" in body["note"]
    for seller in sellers:
        assert seller["placeholder"] is True
        assert "PLACEHOLDER" in seller["name"]
        assert "PLACEHOLDER" in seller["note"]
        assert "maps.google.com" in seller["maps_url"] or "google.com/maps" in seller["maps_url"]
        assert isinstance(seller["lat"], float)
        assert isinstance(seller["lng"], float)


def test_passport_stub(client: TestClient) -> None:
    response = client.get("/passport/OSN-GEN-001")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "OSN-GEN-001"
    assert body["status"] == "PLACEHOLDER"
    assert "PLACEHOLDER" in body["note"] or "not been issued" in body["note"].lower()


def test_importing_app_does_not_load_torch() -> None:
    assert "torch" not in sys.modules
