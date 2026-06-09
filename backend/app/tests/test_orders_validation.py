"""Unit tests for POST /api/orders validation contract.

All tests use a mocked MongoDB collection — no real DB is required.
"""
import json
from unittest.mock import patch

VALID_BRIEF = {
    "occasion": "wedding",
    "eventDate": "2026-09-14",
    "name": "Jordan",
    "relationship": "partner",
    "feeling": "uplifting",
    "feelingNote": "",
    "style": "acoustic",
    "styleNote": "",
    "storyText": "We met at a coffee shop on a rainy Thursday.",
    "email": "customer@example.com",
    "submittedAt": "2026-06-08T10:00:00Z",
}


def _post(client, brief_override=None, *, include_voice=False):
    brief = {**VALID_BRIEF, **(brief_override or {})}
    data = {"brief": json.dumps(brief)}
    files = {"voice": ("recording.webm", b"\x00\x01\x02", "audio/webm")} if include_voice else None
    return client.post("/api/orders", data=data, files=files)


def test_valid_brief_with_story_returns_201(unit_client):
    client, mock_col = unit_client
    resp = _post(client)
    assert resp.status_code == 201
    body = resp.json()
    assert "order_id" in body
    assert body["status"] == "received"
    mock_col.insert_one.assert_awaited_once()


def test_missing_email_returns_422(unit_client):
    client, mock_col = unit_client
    resp = _post(client, {"email": None})
    assert resp.status_code == 422
    mock_col.insert_one.assert_not_awaited()


def test_malformed_email_returns_422(unit_client):
    client, mock_col = unit_client
    resp = _post(client, {"email": "not-an-email"})
    assert resp.status_code == 422
    mock_col.insert_one.assert_not_awaited()


def test_missing_occasion_returns_422(unit_client):
    client, mock_col = unit_client
    resp = _post(client, {"occasion": None})
    assert resp.status_code == 422
    mock_col.insert_one.assert_not_awaited()


def test_empty_occasion_returns_422(unit_client):
    client, mock_col = unit_client
    resp = _post(client, {"occasion": ""})
    assert resp.status_code == 422
    mock_col.insert_one.assert_not_awaited()


def test_missing_both_story_and_voice_returns_422(unit_client):
    client, mock_col = unit_client
    resp = _post(client, {"storyText": None})
    assert resp.status_code == 422
    mock_col.insert_one.assert_not_awaited()


def test_valid_brief_with_voice_no_story_returns_201(unit_client):
    client, mock_col = unit_client
    with patch("app.routers.orders.save_voice_recording", return_value="fake.webm"):
        resp = _post(client, {"storyText": None}, include_voice=True)
    assert resp.status_code == 201
    assert resp.json()["status"] == "received"
    mock_col.insert_one.assert_awaited_once()
