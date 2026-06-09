import secrets
from pathlib import Path

from fastapi import APIRouter, Cookie, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from motor.motor_asyncio import AsyncIOMotorCollection

from app.config import get_settings
from app.db import get_orders_collection
from app.models import ProducerLoginIn, ProducerPatchIn
from app.storage import save_song

router = APIRouter(prefix="/api/producer")

_SESSION_COOKIE = "producer_session"
_SESSION_TTL = 8 * 60 * 60  # 8 hours in seconds
_MAX_SONG_BYTES = 100 * 1024 * 1024  # 100 MB
_ALLOWED_SONG_TYPES = {"audio/wav", "audio/x-wav", "audio/mpeg"}


def _signer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(get_settings().secret_key)


def require_producer_session(
    producer_session: str | None = Cookie(default=None),
) -> None:
    if producer_session is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        _signer().loads(producer_session, max_age=_SESSION_TTL)
    except (BadSignature, SignatureExpired):
        raise HTTPException(status_code=401, detail="Not authenticated")


@router.post("/login")
async def login(body: ProducerLoginIn, response: Response) -> dict:
    settings = get_settings()
    if not secrets.compare_digest(body.password, settings.producer_password):
        raise HTTPException(status_code=401, detail="Invalid password")
    token = _signer().dumps("producer")
    response.set_cookie(
        key=_SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=_SESSION_TTL,
    )
    return {"status": "ok"}


@router.get("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(key=_SESSION_COOKIE)
    return {"status": "ok"}


@router.get("/orders")
async def list_orders(
    _: None = Depends(require_producer_session),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> list:
    result = []
    async for doc in collection.find({}).sort("received_at", -1):
        received_at = doc.get("received_at")
        result.append(
            {
                "order_id": doc["order_id"],
                "name": doc.get("name", ""),
                "occasion": doc.get("occasion", ""),
                "status": doc.get("status", "received"),
                "received_at": (
                    received_at.isoformat()
                    if hasattr(received_at, "isoformat")
                    else str(received_at or "")
                ),
                "has_voice": doc.get("voice_recording_reference") is not None,
            }
        )
    return result


@router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    _: None = Depends(require_producer_session),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> dict:
    doc = await collection.find_one({"order_id": order_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Order not found")
    doc.pop("_id", None)
    received_at = doc.get("received_at")
    if hasattr(received_at, "isoformat"):
        doc["received_at"] = received_at.isoformat()
    doc.setdefault("status", "received")
    return doc


@router.patch("/orders/{order_id}")
async def patch_order(
    order_id: str,
    body: ProducerPatchIn,
    _: None = Depends(require_producer_session),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> dict:
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=422, detail="No fields provided")
    result = await collection.update_one({"order_id": order_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "updated"}


@router.post("/orders/{order_id}/song")
async def upload_song(
    order_id: str,
    file: UploadFile = File(...),
    _: None = Depends(require_producer_session),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> dict:
    content_type = (file.content_type or "").split(";")[0].strip()
    if content_type not in _ALLOWED_SONG_TYPES:
        raise HTTPException(status_code=422, detail="Only WAV or MP3 files are accepted")
    data = await file.read(_MAX_SONG_BYTES + 1)
    if len(data) > _MAX_SONG_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 100 MB limit")
    doc = await collection.find_one({"order_id": order_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Order not found")
    settings = get_settings()
    old_ref = doc.get("song_reference")
    relative_name = save_song(
        data,
        base_dir=settings.song_storage_dir,
        filename=file.filename,
        content_type=content_type,
    )
    await collection.update_one(
        {"order_id": order_id}, {"$set": {"song_reference": relative_name}}
    )
    if old_ref:
        old_path = Path(settings.song_storage_dir) / old_ref
        if old_path.exists():
            old_path.unlink()
    return {"status": "uploaded", "song_reference": relative_name}


@router.get("/orders/{order_id}/voice")
async def stream_voice(
    order_id: str,
    _: None = Depends(require_producer_session),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> FileResponse:
    doc = await collection.find_one({"order_id": order_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Order not found")
    ref = doc.get("voice_recording_reference")
    if not ref:
        raise HTTPException(status_code=404, detail="No voice recording for this order")
    storage_dir = Path(get_settings().voice_storage_dir).resolve()
    file_path = (storage_dir / ref).resolve()
    try:
        file_path.relative_to(storage_dir)
    except ValueError:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Voice recording not found on disk")
    return FileResponse(file_path)
