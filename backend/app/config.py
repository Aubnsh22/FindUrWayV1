"""
Application configuration using Pydantic Settings.
Reads from .env file and environment variables.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql://postgres@localhost:5432/findurway"

    # Adzuna API
    ADZUNA_APP_ID: str = "your_app_id_here"
    ADZUNA_APP_KEY: str = "your_app_key_here"

    # France Travail API
    FRANCE_TRAVAIL_CLIENT_ID: str = ""
    FRANCE_TRAVAIL_CLIENT_SECRET: str = ""

    # NLP Model
    MODEL_NAME: str = "all-MiniLM-L6-v2"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # JWT
    JWT_SECRET: str = "findurway-jwt-secret-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 1440  # 24 hours

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — only reads .env once."""
    return Settings()
