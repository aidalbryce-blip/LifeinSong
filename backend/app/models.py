from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderBriefIn(BaseModel):
    """Validates the JSON-encoded `brief` form field of `POST /api/orders`.

    Field names use camelCase aliases to match the wire format produced by
    `buildBrief()` in `frontend/src/app/intake/intake-form.tsx`.
    """

    model_config = ConfigDict(populate_by_name=True)

    occasion: str = Field(min_length=1)
    event_date: str = Field(alias="eventDate", default="")
    name: str = Field(default="")
    relationship: str = Field(default="")
    feeling: str | None = Field(default=None)
    feeling_note: str = Field(alias="feelingNote", default="")
    style: str | None = Field(default=None)
    style_note: str = Field(alias="styleNote", default="")
    story_text: str | None = Field(alias="storyText", default=None)
    email: EmailStr
    submitted_at: str = Field(alias="submittedAt", default="")


class ProducerLoginIn(BaseModel):
    password: str


class ProducerPatchIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[str] = None
    internal_notes: Optional[str] = None
    song_reference: Optional[str] = None
    chorus_lyrics: Optional[str] = None
    full_lyrics: Optional[str] = None
    producer_message: Optional[str] = None
