"""AdireTrust API skeleton.

This service does not load a vision model. POST /check returns a clearly
marked stub verdict until the DINOv2 probe is trained and wired in.
Do not import torch (or any heavy ML library) at module import time.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    intron_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    intron_base_url: str = "https://infer.voice.intron.io"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    data_dir: str = "../data"
    confidence_threshold: float = 0.6

    @property
    def origins(self) -> list[str]:
        raw = [part.strip() for part in self.allowed_origins.split(",") if part.strip()]
        return raw or ["http://localhost:5173"]


settings = Settings()

app = FastAPI(
    title="AdireTrust API",
    description=(
        "Phone-camera check for hand-dyed Abeokuta adire versus factory prints. "
        "Current /check responses are stubs, not model results."
    ),
    version="0.1.0-stub",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PriceGuidance(BaseModel):
    status: str
    note: str
    buy_range_ngn: list[int] | None = None
    sell_range_ngn: list[int] | None = None


class CheckResponse(BaseModel):
    label: str = Field(description="genuine_hand_dyed, factory_print, or uncertain")
    confidence: float
    reasons: list[str]
    price_guidance: PriceGuidance
    model_version: str = "stub"
    filename: str | None = None


class Seller(BaseModel):
    id: str
    name: str
    market: str
    city: str
    lat: float
    lng: float
    maps_url: str
    placeholder: bool = True
    note: str


class PassportResponse(BaseModel):
    id: str
    status: str
    note: str
    artisan_name: str | None = None
    workshop: str | None = None
    market: str | None = None
    date: str | None = None
    photo_urls: list[str] = Field(default_factory=list)
    maps_url: str | None = None


# Five fixture sellers for the map UI. These are not real people or shops.
PLACEHOLDER_SELLERS: list[dict[str, Any]] = [
    {
        "id": "placeholder-itoku-01",
        "name": "PLACEHOLDER — Itoku Market stall A",
        "market": "Itoku Market",
        "city": "Abeokuta, Ogun State",
        "lat": 7.1605,
        "lng": 3.3478,
        "maps_url": "https://www.google.com/maps?q=7.1605,3.3478",
        "placeholder": True,
        "note": "PLACEHOLDER fixture for demo pins. Not a real stall, artisan, or listing.",
    },
    {
        "id": "placeholder-itoku-02",
        "name": "PLACEHOLDER — Itoku Market stall B",
        "market": "Itoku Market",
        "city": "Abeokuta, Ogun State",
        "lat": 7.1612,
        "lng": 3.3486,
        "maps_url": "https://www.google.com/maps?q=7.1612,3.3486",
        "placeholder": True,
        "note": "PLACEHOLDER fixture for demo pins. Not a real stall, artisan, or listing.",
    },
    {
        "id": "placeholder-kemta-01",
        "name": "PLACEHOLDER — Kemta workshop",
        "market": "Kemta Adire Market",
        "city": "Abeokuta, Ogun State",
        "lat": 7.1479,
        "lng": 3.3514,
        "maps_url": "https://www.google.com/maps?q=7.1479,3.3514",
        "placeholder": True,
        "note": "PLACEHOLDER fixture for demo pins. Not a real workshop or artisan.",
    },
    {
        "id": "placeholder-asero-01",
        "name": "PLACEHOLDER — Asero Market stall",
        "market": "Asero Market",
        "city": "Abeokuta, Ogun State",
        "lat": 7.1750,
        "lng": 3.3860,
        "maps_url": "https://www.google.com/maps?q=7.1750,3.3860",
        "placeholder": True,
        "note": "PLACEHOLDER fixture for demo pins. Not a real stall or artisan.",
    },
    {
        "id": "placeholder-cooperative-01",
        "name": "PLACEHOLDER — Adire cooperative booth",
        "market": "Ogun Tech Hub area (demo pin)",
        "city": "Kobape, Abeokuta, Ogun State",
        "lat": 7.0890,
        "lng": 3.3830,
        "maps_url": "https://www.google.com/maps?q=7.0890,3.3830",
        "placeholder": True,
        "note": "PLACEHOLDER fixture for demo pins. Not a real cooperative listing.",
    },
]


STUB_PRICE = PriceGuidance(
    status="PLACEHOLDER",
    note=(
        "Not a real market quote. Buy/sell guidance will be added only after a "
        "trained model and local price sources are in place."
    ),
    buy_range_ngn=None,
    sell_range_ngn=None,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/check", response_model=CheckResponse)
async def check(image: UploadFile = File(...)) -> CheckResponse:
    """Accept a cloth photo and return a stub verdict.

    A future revision will run the DINOv2 linear probe and may abstain when
    confidence is below CONFIDENCE_THRESHOLD. This stub always returns
    `uncertain` with confidence 0.0 so nobody confuses it with a model score.
    """
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")

    payload = await image.read(32)
    if not payload:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    return CheckResponse(
        label="uncertain",
        confidence=0.0,
        reasons=[
            "STUB: no trained model is loaded. This is a placeholder response, not an authenticity result.",
            "Capture protocol (for the real model): photograph the front, the reverse, and a close edge or resist line.",
        ],
        price_guidance=STUB_PRICE,
        model_version="stub",
        filename=image.filename,
    )


@app.get("/sellers")
def sellers() -> dict[str, Any]:
    return {
        "sellers": PLACEHOLDER_SELLERS,
        "note": "All entries are PLACEHOLDER fixtures, not real artisans or shops.",
    }


@app.get("/passport/{item_id}", response_model=PassportResponse)
def passport(item_id: str) -> PassportResponse:
    return PassportResponse(
        id=item_id,
        status="PLACEHOLDER",
        note=(
            "QR Adire Passport records have not been issued yet. "
            "This stub does not identify a real artisan or piece."
        ),
        artisan_name=None,
        workshop=None,
        market=None,
        date=None,
        photo_urls=[],
        maps_url=None,
    )


def data_path() -> Path:
    return Path(os.environ.get("DATA_DIR", settings.data_dir)).resolve()
