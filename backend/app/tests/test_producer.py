import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from itsdangerous import SignatureExpired, URLSafeTimedSerializer
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.db import get_orders_collection
from app.main import app

TEST_SECRET = "test-secret-key"
TEST_PASSWORD = "test-password"
TEST_MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
TEST_DB_NAME = "lifeinsong_test"
SESSION_COOKIE = "producer_session"


def _make_token(secret: str = TEST_SECRET) -> str:
    return URLSafeTimedSerializer(secret).dumps("producer")


class _AsyncIter:
    """Minimal async iterable for mocking Motor cursors."""

    def __init__(self, items: list) -> None:
        self._items = items

    def sort(self, *args, **kwargs) -> "_AsyncIter":
        return self

    def __aiter__(self):
        return self._gen()

    async def _gen(self):
        for item in self._items:
            yield item


# ── shared env patch (unit tests) ─────────────────────────────────────────────

@pytest.fixture(autouse=True)
def patch_settings_env():
    with patch.dict(os.environ, {"SECRET_KEY": TEST_SECRET, "PRODUCER_PASSWORD": TEST_PASSWORD}):
        get_settings.cache_clear()
        yield
    get_settings.cache_clear()


# ── unit fixtures ──────────────────────────────────────────────────────────────

@pytest.fixture()
def mock_col():
    col = MagicMock()
    col.find_one = AsyncMock(return_value=None)
    col.find = MagicMock(return_value=_AsyncIter([]))
    col.update_one = AsyncMock(return_value=MagicMock(matched_count=1))
    return col


@pytest.fixture()
def unit_client(mock_col):
    app.dependency_overrides[get_orders_collection] = lambda: mock_col
    with TestClient(app, raise_server_exceptions=True) as client:
        yield client, mock_col
    app.dependency_overrides.clear()


# ── unit tests ─────────────────────────────────────────────────────────────────

def test_login_correct_password_sets_cookie(unit_client):
    client, _ = unit_client
    resp = client.post("/api/producer/login", json={"password": TEST_PASSWORD})
    assert resp.status_code == 200
    assert SESSION_COOKIE in resp.cookies


def test_login_wrong_password_returns_401(unit_client):
    client, _ = unit_client
    resp = client.post("/api/producer/login", json={"password": "wrong"})
    assert resp.status_code == 401


def test_missing_cookie_returns_401(unit_client):
    client, _ = unit_client
    resp = client.get("/api/producer/orders")
    assert resp.status_code == 401


def test_expired_cookie_returns_401(unit_client):
    client, _ = unit_client
    with patch("app.routers.producer._signer") as mock_signer_fn:
        mock_signer_fn.return_value.loads.side_effect = SignatureExpired(
            "expired", payload=None, date_signed=None
        )
        resp = client.get(
            "/api/producer/orders",
            cookies={SESSION_COOKIE: "some.expired.token"},
        )
    assert resp.status_code == 401


def test_list_orders_with_valid_session_returns_200_and_list_shape(unit_client):
    client, mock_col = unit_client
    mock_col.find = MagicMock(
        return_value=_AsyncIter(
            [
                {
                    "order_id": "abc123",
                    "name": "Test",
                    "occasion": "birthday",
                    "received_at": datetime(2024, 1, 1, tzinfo=timezone.utc),
                    "voice_recording_reference": None,
                }
            ]
        )
    )
    resp = client.get("/api/producer/orders", cookies={SESSION_COOKIE: _make_token()})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["order_id"] == "abc123"
    assert data[0]["status"] == "received"
    assert data[0]["has_voice"] is False
    assert "internal_notes" not in data[0]
    assert "full_lyrics" not in data[0]


def test_patch_order_update_persisted(unit_client):
    client, mock_col = unit_client
    mock_col.find_one = AsyncMock(return_value={"order_id": "abc123"})
    resp = client.patch(
        "/api/producer/orders/abc123",
        json={"internal_notes": "Great story"},
        cookies={SESSION_COOKIE: _make_token()},
    )
    assert resp.status_code == 200
    call_args = mock_col.update_one.call_args
    assert call_args[0][1]["$set"]["internal_notes"] == "Great story"


def test_song_upload_exceeds_100mb_returns_413(unit_client, tmp_path):
    client, mock_col = unit_client
    mock_col.find_one = AsyncMock(return_value={"order_id": "abc123", "song_reference": None})
    with patch.dict(os.environ, {"SONG_STORAGE_DIR": str(tmp_path)}):
        get_settings.cache_clear()
        large_data = b"x" * (_MAX_SONG_BYTES + 1)
        resp = client.post(
            "/api/producer/orders/abc123/song",
            files={"file": ("song.mp3", large_data, "audio/mpeg")},
            cookies={SESSION_COOKIE: _make_token()},
        )
    assert resp.status_code == 413


def test_voice_endpoint_404_when_no_recording(unit_client):
    client, mock_col = unit_client
    mock_col.find_one = AsyncMock(
        return_value={"order_id": "abc123", "voice_recording_reference": None}
    )
    resp = client.get(
        "/api/producer/orders/abc123/voice", cookies={SESSION_COOKIE: _make_token()}
    )
    assert resp.status_code == 404


_MAX_SONG_BYTES = 100 * 1024 * 1024


# ── integration tests ──────────────────────────────────────────────────────────

@pytest.fixture()
async def integration_client(tmp_path):
    song_dir = str(tmp_path / "song_storage")
    with patch.dict(
        os.environ,
        {
            "MONGODB_DB_NAME": TEST_DB_NAME,
            "SONG_STORAGE_DIR": song_dir,
        },
    ):
        get_settings.cache_clear()
        mongo_client = AsyncIOMotorClient(TEST_MONGO_URI)
        collection = mongo_client[TEST_DB_NAME]["orders"]
        await collection.drop()
        app.dependency_overrides[get_orders_collection] = lambda: collection
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            yield client, collection, tmp_path
        app.dependency_overrides.clear()
        await collection.drop()
        mongo_client.close()
    get_settings.cache_clear()


async def test_full_producer_flow(integration_client):
    client, collection, tmp_path = integration_client

    await collection.insert_one(
        {
            "order_id": "order001",
            "occasion": "wedding",
            "name": "Alex",
            "email": "alex@example.com",
            "received_at": datetime(2024, 6, 1, tzinfo=timezone.utc),
            "voice_recording_reference": None,
        }
    )

    # login
    resp = await client.post("/api/producer/login", json={"password": TEST_PASSWORD})
    assert resp.status_code == 200
    cookie = resp.cookies.get(SESSION_COOKIE)
    assert cookie is not None
    cookies = {SESSION_COOKIE: cookie}

    # get orders — order appears in list
    resp = await client.get("/api/producer/orders", cookies=cookies)
    assert resp.status_code == 200
    orders = resp.json()
    assert any(o["order_id"] == "order001" for o in orders)
    order_item = next(o for o in orders if o["order_id"] == "order001")
    assert order_item["occasion"] == "wedding"
    assert "internal_notes" not in order_item

    # patch notes
    resp = await client.patch(
        "/api/producer/orders/order001",
        json={"internal_notes": "Lovely story", "status": "in_progress"},
        cookies=cookies,
    )
    assert resp.status_code == 200

    # upload song
    song_bytes = b"RIFF" + b"\x00" * 40  # minimal fake WAV header
    resp = await client.post(
        "/api/producer/orders/order001/song",
        files={"file": ("song.wav", song_bytes, "audio/wav")},
        cookies=cookies,
    )
    assert resp.status_code == 200
    song_ref = resp.json()["song_reference"]
    assert song_ref

    # get full order — verify all fields present and updated
    resp = await client.get("/api/producer/orders/order001", cookies=cookies)
    assert resp.status_code == 200
    doc = resp.json()
    assert doc["order_id"] == "order001"
    assert doc["internal_notes"] == "Lovely story"
    assert doc["status"] == "in_progress"
    assert doc["song_reference"] == song_ref
    assert doc["occasion"] == "wedding"
    assert "_id" not in doc
