import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import ValidationError

from app.config import get_settings
from app.db import get_orders_collection
from app.models import OrderBriefIn
from app.storage import save_voice_recording

router = APIRouter(prefix="/api")


@router.post("/orders", status_code=201)
async def create_order(
    brief: str = Form(...),
    voice: UploadFile | None = File(None),
    collection: AsyncIOMotorCollection = Depends(get_orders_collection),
):
    try:
        parsed = OrderBriefIn.model_validate_json(brief)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail={"errors": exc.errors(include_url=False)})

    has_story = bool(parsed.story_text and parsed.story_text.strip())
    if not has_story and voice is None:
        raise HTTPException(
            status_code=422,
            detail={
                "errors": [
                    {
                        "loc": ["body", "brief"],
                        "msg": "Provide a story or a voice recording.",
                        "type": "missing",
                    }
                ]
            },
        )

    voice_reference: str | None = None
    if voice is not None:
        data = await voice.read()
        voice_reference = save_voice_recording(
            data,
            base_dir=get_settings().voice_storage_dir,
            filename=voice.filename,
            content_type=voice.content_type,
        )

    order_id = uuid.uuid4().hex
    received_at = datetime.now(timezone.utc)

    await collection.insert_one(
        {
            "order_id": order_id,
            "occasion": parsed.occasion,
            "event_date": parsed.event_date,
            "name": parsed.name,
            "relationship": parsed.relationship,
            "feeling": parsed.feeling,
            "feeling_note": parsed.feeling_note,
            "style": parsed.style,
            "style_note": parsed.style_note,
            "voice_recording_reference": voice_reference,
            "story_text": parsed.story_text,
            "email": str(parsed.email),
            "submitted_at": parsed.submitted_at,
            "received_at": received_at,
        }
    )

    return JSONResponse(status_code=201, content={"order_id": order_id, "status": "received"})
