"""
Application configuration using Pydantic Settings.
Reads from .env file and environment variables.
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:102004@localhost:5432/findurway"

    # Adzuna API
    ADZUNA_APP_ID: str = "your_app_id_here"
    ADZUNA_APP_KEY: str = "your_app_key_here"

    # NLP Model
    MODEL_NAME: str = "all-MiniLM-L6-v2"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — only reads .env once."""
    return Settings()
