"""Integration tests for POST /api/orders.

Runs a full round-trip against a real local MongoDB (`lifeinsong_test` database).
Requires `docker compose up -d` from the repo root before running.
"""
import json
from pathlib import Path

import pytest

VALID_BRIEF = {
    "occasion": "wedding",
    "eventDate": "2026-09-14",
    "name": "Jordan",
    "relationship": "partner",
    "feeling": "uplifting",
    "feelingNote": "Keep it light",
    "style": "acoustic",
    "styleNote": "",
    "storyText": "We met at a coffee shop on a rainy Thursday.",
    "email": "customer@example.com",
    "submittedAt": "2026-06-08T10:00:00Z",
}

FR08_FIELDS = {
    "occasion",
    "event_date",
    "name",
    "relationship",
    "feeling",
    "feeling_note",
    "style",
    "style_note",
    "voice_recording_reference",
    "story_text",
    "email",
    "submitted_at",
    "received_at",
    "order_id",
}


@pytest.mark.asyncio
async def test_post_brief_with_story_persists_to_mongo(integration_client):
    client, collection, _ = integration_client

    resp = await client.post(
        "/api/orders",
        data={"brief": json.dumps(VALID_BRIEF)},
    )

    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "received"
    order_id = body["order_id"]
    assert order_id

    doc = await collection.find_one({"order_id": order_id})
    assert doc is not None
    assert FR08_FIELDS.issubset(doc.keys())
    assert doc["occasion"] == "wedding"
    assert doc["email"] == "customer@example.com"
    assert doc["story_text"] == VALID_BRIEF["storyText"]
    assert doc["voice_recording_reference"] is None
    assert doc["received_at"] is not None


@pytest.mark.asyncio
async def test_post_brief_with_voice_persists_file_reference(integration_client):
    client, collection, storage_dir = integration_client

    fake_audio = b"\xff\xfb\x90\x00" * 256
    brief = {**VALID_BRIEF, "storyText": None}

    resp = await client.post(
        "/api/orders",
        data={"brief": json.dumps(brief)},
        files={"voice": ("recording.webm", fake_audio, "audio/webm")},
    )

    assert resp.status_code == 201
    order_id = resp.json()["order_id"]

    doc = await collection.find_one({"order_id": order_id})
    assert doc is not None
    ref = doc["voice_recording_reference"]
    assert ref is not None and ref.endswith(".webm")

    stored_file = Path(storage_dir) / ref
    assert stored_file.exists()
    assert stored_file.read_bytes() == fake_audio
