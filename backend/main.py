"""AdireTrust API skeleton.

This service does not load a vision model. POST /check returns a clearly
marked stub verdict until the DINOv2 probe is trained and wired in.
Do not import torch (or any heavy ML library) at module import time.
"""

from __future__ import annotations

import os
import json
import re
from io import BytesIO
from pathlib import Path
from typing import Any, Literal

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from PIL import Image, UnidentifiedImageError


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    intron_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
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


Language = Literal["en", "yo", "ha", "ig", "pcm"]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=12)
    language: Language = "en"


class ChatResponse(BaseModel):
    reply: str
    language: Language
    model: str


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4096)
    voice_language: Language
    voice_accent: str = Field(min_length=1, max_length=80)
    voice_gender: Literal["male", "female"]
    output_audio_format: Literal["wav", "opus"] = "wav"


MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_AUDIO_BYTES = 20 * 1024 * 1024
INTRON_TIMEOUT_SECONDS = 130.0
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
LANGUAGE_NAMES = {
    "en": "English",
    "yo": "Yoruba",
    "ha": "Hausa",
    "ig": "Igbo",
    "pcm": "Nigerian Pidgin",
}


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

    payload = await image.read(MAX_IMAGE_BYTES + 1)
    if not payload:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(payload) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image uploads must be 10 MB or smaller.")

    try:
        with Image.open(BytesIO(payload)) as uploaded_image:
            uploaded_image.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from None

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
    records_path = data_path() / "sellers.json"
    if records_path.is_file():
        try:
            payload = json.loads(records_path.read_text(encoding="utf-8"))
            rows = payload.get("sellers", []) if isinstance(payload, dict) else payload
            records = [Seller.model_validate(row).model_dump() for row in rows]
        except (OSError, json.JSONDecodeError, TypeError, ValueError) as exc:
            raise HTTPException(status_code=500, detail="Seller records are invalid.") from exc
        return {"sellers": records, "note": "Seller records loaded from configured data."}

    return {
        "sellers": PLACEHOLDER_SELLERS,
        "note": "All entries are PLACEHOLDER fixtures, not real artisans or shops.",
    }


@app.get("/passport/{item_id}", response_model=PassportResponse)
def passport(item_id: str) -> PassportResponse:
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", item_id):
        raise HTTPException(status_code=400, detail="Invalid passport ID.")

    record_path = data_path() / "passports" / f"{item_id}.json"
    if record_path.is_file():
        try:
            payload = json.loads(record_path.read_text(encoding="utf-8"))
            payload["id"] = item_id
            return PassportResponse.model_validate(payload)
        except (OSError, json.JSONDecodeError, TypeError, ValueError) as exc:
            raise HTTPException(status_code=500, detail="Passport record is invalid.") from exc

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


@app.get("/capabilities")
def capabilities() -> dict[str, Any]:
    return {
        "photo_check": {"available": False, "model_version": "stub"},
        "text_chat": {"available": bool(settings.groq_api_key)},
        "voice_input": {"available": bool(settings.intron_api_key)},
        "voice_output": {"available": bool(settings.intron_api_key)},
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail={"code": "TEXT_CHAT_UNAVAILABLE", "message": "Text chat is not configured."},
        )
    if request.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="The last chat message must be from the user.")

    language_name = LANGUAGE_NAMES[request.language]
    system_message = {
        "role": "system",
        "content": (
            "You are AdireTrust's helpful guide to Adire and buying textiles. "
            "Reply in " + language_name + ". Explain that a photo-based check is a research/demo aid, "
            "not a certificate or proof of manufacturing process. Never invent prices, seller names, "
            "artisan details, provenance, model scores, or visual evidence. If asked for information "
            "not supplied in the conversation, say you do not have a verified source for it."
        ),
    }
    payload = {
        "model": settings.groq_model,
        "messages": [system_message, *[message.model_dump() for message in request.messages]],
        "max_completion_tokens": 500,
        "temperature": 0.4,
    }
    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            response = await client.post(
                GROQ_CHAT_URL,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json=payload,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Text chat provider is unavailable.") from exc
    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail=f"Text chat provider returned HTTP {response.status_code}.",
        )
    try:
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Text chat provider returned an invalid response.") from exc
    return ChatResponse(reply=reply, language=request.language, model=result.get("model", settings.groq_model))


def require_intron_key() -> str:
    if not settings.intron_api_key:
        raise HTTPException(
            status_code=503,
            detail={"code": "VOICE_UNAVAILABLE", "message": "Voice is not configured; use text chat."},
        )
    return settings.intron_api_key


async def intron_json_request(path: str, *, api_key: str, json_body: dict[str, Any] | None = None) -> httpx.Response:
    try:
        async with httpx.AsyncClient(timeout=INTRON_TIMEOUT_SECONDS) as client:
            return await client.post(
                f"{settings.intron_base_url.rstrip('/')}/{path.lstrip('/')}",
                headers={"Authorization": f"Bearer {api_key}"},
                json=json_body,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Voice provider is unavailable.") from exc


async def intron_status_request(path: str, *, api_key: str) -> httpx.Response:
    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            return await client.get(
                f"{settings.intron_base_url.rstrip('/')}/{path.lstrip('/')}",
                headers={"Authorization": f"Bearer {api_key}"},
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Voice provider is unavailable.") from exc


def parse_intron_json(response: httpx.Response) -> dict[str, Any]:
    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Voice provider returned an invalid response.") from exc
    if response.status_code == 503 and isinstance(payload, dict):
        return payload
    if response.is_error:
        raise HTTPException(status_code=502, detail=f"Voice provider returned HTTP {response.status_code}.")
    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Voice provider returned an invalid response.")
    return payload


@app.post("/voice/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Language = Form(...),
) -> Any:
    api_key = require_intron_key()
    filename = Path(audio.filename or "recording.wav").name
    extension = Path(filename).suffix.lower()
    if extension not in {".wav", ".mp3", ".mp4", ".m4a", ".ogg", ".webm", ".flac"}:
        raise HTTPException(status_code=400, detail="Use WAV, MP3, MP4, M4A, OGG, WebM, or FLAC audio.")
    audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="The audio upload is empty.")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio uploads must be 20 MB or smaller.")

    try:
        async with httpx.AsyncClient(timeout=INTRON_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{settings.intron_base_url.rstrip('/')}/file/v1/upload/sync",
                headers={"Authorization": f"Bearer {api_key}"},
                data={
                    "audio_file_name": filename,
                    "use_language_asr_input": language,
                },
                files={
                    "audio_file_blob": (
                        filename,
                        audio_bytes,
                        audio.content_type or "application/octet-stream",
                    )
                },
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Voice provider is unavailable.") from exc

    payload = parse_intron_json(response)
    data = payload.get("data", {})
    if response.status_code == 503 and data.get("file_id"):
        return JSONResponse(
            status_code=202,
            content={"file_id": data["file_id"], "status": "processing", "language": language},
        )
    transcript = data.get("audio_transcript")
    if not transcript:
        raise HTTPException(status_code=502, detail="Voice provider did not return a transcript.")
    return {"transcript": transcript, "language": language, "status": data.get("processing_status", "complete")}


@app.post("/voice/speech")
async def generate_speech(request: SpeechRequest) -> Any:
    api_key = require_intron_key()
    response = await intron_json_request(
        "/tts/v1/generate",
        api_key=api_key,
        json_body=request.model_dump(),
    )
    payload = parse_intron_json(response)
    data = payload.get("data", {})
    if response.status_code == 503 and data.get("text_id"):
        return JSONResponse(
            status_code=202,
            content={"text_id": data["text_id"], "status": "processing"},
        )
    if not data.get("audio_path"):
        raise HTTPException(status_code=502, detail="Voice provider did not return an audio URL.")
    return {
        "audio_url": data["audio_path"],
        "audio_duration_in_seconds": data.get("audio_duration_in_seconds"),
        "status": data.get("processing_status", "complete"),
    }


@app.get("/voice/transcriptions/{file_id}")
async def transcription_status(file_id: str) -> dict[str, Any]:
    if not re.fullmatch(r"[A-Za-z0-9-]{1,100}", file_id):
        raise HTTPException(status_code=400, detail="Invalid transcription ID.")
    response = await intron_status_request(f"/file/v1/status/{file_id}", api_key=require_intron_key())
    payload = parse_intron_json(response)
    data = payload.get("data", {})
    return {
        "file_id": file_id,
        "status": data.get("processing_status", payload.get("status", "unknown")),
        "transcript": data.get("audio_transcript"),
    }


@app.get("/voice/speech/{text_id}")
async def speech_status(text_id: str) -> dict[str, Any]:
    if not re.fullmatch(r"[A-Za-z0-9-]{1,100}", text_id):
        raise HTTPException(status_code=400, detail="Invalid speech ID.")
    response = await intron_status_request(f"/tts/v1/status/{text_id}", api_key=require_intron_key())
    payload = parse_intron_json(response)
    data = payload.get("data", {})
    return {
        "text_id": text_id,
        "status": data.get("processing_status", payload.get("status", "unknown")),
        "audio_url": data.get("audio_path"),
        "audio_duration_in_seconds": data.get("audio_duration_in_seconds"),
    }
