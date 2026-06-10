from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorCollection

from app.config import get_settings
from app.db import get_orders_collection
from app.models import ConsumerPatchIn

router = APIRouter(prefix="/api/consumer")

_ACCESSIBLE_STATUSES = {"awaiting_review", "approved", "revision_requested", "delivered"}
_PREVIEW_STATUSES = {"awaiting_review", "approved", "revision_requested", "delivered"}


async def _get_doc(token: str, collection: AsyncIOMotorCollection) -> dict:
    doc = await collection.find_one({"delivery_token": token})
    if doc is None or doc.get("status", "received") not in _ACCESSIBLE_STATUSES:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@router.get("/orders/{token}")
async def get_order(
    token: str,
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> dict:
    doc = await _get_doc(token, collection)
    download_unlocked = doc.get("download_unlocked", False)
    received_at = doc.get("received_at")
    result: dict = {
        "order_id": doc["order_id"],
        "name": doc.get("name", ""),
        "occasion": doc.get("occasion", ""),
        "event_date": doc.get("event_date", ""),
        "relationship": doc.get("relationship", ""),
        "feeling": doc.get("feeling"),
        "feeling_note": doc.get("feeling_note", ""),
        "style": doc.get("style"),
        "style_note": doc.get("style_note", ""),
        "story_text": doc.get("story_text"),
        "status": doc.get("status", "received"),
        "chorus_lyrics": doc.get("chorus_lyrics", ""),
        "producer_message": doc.get("producer_message", ""),
        "delivery_token": token,
        "download_unlocked": download_unlocked,
        "has_song": doc.get("song_reference") is not None,
        "received_at": (
            received_at.isoformat()
            if hasattr(received_at, "isoformat")
            else str(received_at or "")
        ),
    }
    if download_unlocked:
        result["full_lyrics"] = doc.get("full_lyrics", "")
    return result


@router.patch("/orders/{token}")
async def patch_order(
    token: str,
    body: ConsumerPatchIn,
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> dict:
    await _get_doc(token, collection)
    if body.action == "approve":
        await collection.update_one(
            {"delivery_token": token}, {"$set": {"status": "approved"}}
        )
    else:
        updates: dict = {"status": "revision_requested"}
        if body.revision_note is not None:
            updates["revision_note"] = body.revision_note
        await collection.update_one({"delivery_token": token}, {"$set": updates})
    return {"status": "updated"}


@router.get("/orders/{token}/song")
async def stream_song(
    token: str,
    download: bool = False,
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
) -> FileResponse:
    doc = await collection.find_one({"delivery_token": token})
    if doc is None:
        raise HTTPException(status_code=404, detail="Not found")

    order_status = doc.get("status", "received")
    download_unlocked = doc.get("download_unlocked", False)

    if order_status not in _PREVIEW_STATUSES and not download_unlocked:
        raise HTTPException(status_code=403, detail="Song not available yet")

    ref = doc.get("song_reference")
    if not ref:
        raise HTTPException(status_code=404, detail="No song uploaded yet")

    storage_dir = Path(get_settings().song_storage_dir).resolve()
    file_path = (storage_dir / ref).resolve()
    try:
        file_path.relative_to(storage_dir)
    except ValueError:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Song file not found on disk")

    headers = {}
    if download and download_unlocked:
        suffix = Path(ref).suffix or ""
        headers["Content-Disposition"] = f'attachment; filename="your-song{suffix}"'

    return FileResponse(file_path, headers=headers)
