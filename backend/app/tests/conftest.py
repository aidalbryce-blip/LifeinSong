import os
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.db import get_orders_collection
from app.main import app

TEST_MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
TEST_DB_NAME = "lifeinsong_test"


# ── unit-test fixtures (mocked DB) ────────────────────────────────────────────

@pytest.fixture()
def mock_collection():
    col = MagicMock()
    col.insert_one = AsyncMock(return_value=MagicMock(inserted_id="fake_id"))
    return col


@pytest.fixture()
def unit_client(mock_collection):
    app.dependency_overrides[get_orders_collection] = lambda: mock_collection
    with TestClient(app) as client:
        yield client, mock_collection
    app.dependency_overrides.clear()


# ── integration-test fixtures (real Mongo) ───────────────────────────────────

@pytest_asyncio.fixture()
async def real_collection():
    client = AsyncIOMotorClient(TEST_MONGO_URI)
    col = client[TEST_DB_NAME]["orders"]
    await col.drop()
    yield col
    await col.drop()
    client.close()


@pytest_asyncio.fixture()
async def integration_client(real_collection, tmp_path):
    storage_dir = str(tmp_path / "voice_storage")

    get_settings.cache_clear()
    os.environ["MONGODB_DB_NAME"] = TEST_DB_NAME
    os.environ["VOICE_STORAGE_DIR"] = storage_dir

    app.dependency_overrides[get_orders_collection] = lambda: real_collection
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client, real_collection, storage_dir
    app.dependency_overrides.clear()
    get_settings.cache_clear()
