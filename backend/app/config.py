import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        self.mongodb_db_name = os.environ.get("MONGODB_DB_NAME", "lifeinsong")
        self.voice_storage_dir = os.environ.get("VOICE_STORAGE_DIR", "./voice_storage")
        self.cors_origins = [
            origin.strip()
            for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
            if origin.strip()
        ]
        self.producer_password = os.environ.get("PRODUCER_PASSWORD", "")
        self.secret_key = os.environ.get("SECRET_KEY", "")
        self.song_storage_dir = os.environ.get("SONG_STORAGE_DIR", "./song_storage")


@lru_cache
def get_settings() -> Settings:
    return Settings()
