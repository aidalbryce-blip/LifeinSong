from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

from app.config import get_settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(get_settings().mongodb_uri)
    return _client


def get_orders_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_client()[settings.mongodb_db_name]["orders"]
