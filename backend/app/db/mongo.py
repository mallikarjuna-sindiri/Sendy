from datetime import timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri, tz_aware=True, tzinfo=timezone.utc)
    return _client


def get_db():
    client = get_client()
    return client[settings.mongodb_db]
