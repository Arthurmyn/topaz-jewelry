"""Application settings. Single source of configuration, read from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    env: Literal["local", "test", "production"] = "local"
    site_url: str = "http://localhost:8080"

    database_url: str
    redis_url: str
    secret_key: str

    # Feature flags (see ARCHITECTURE.md section 6)
    feature_accounts: bool = False
    feature_payments: bool = False

    # Sessions / cookies
    cookie_secure: bool = False
    session_hours_customer: int = 24 * 30
    session_hours_admin: int = 8
    rate_limit_enabled: bool = True

    # Payments
    payment_provider: str = "mock"
    payment_webhook_secret: str = "dev-webhook-secret"  # noqa: S105

    # Object storage (S3 compatible)
    s3_endpoint_url: str = "http://minio:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"  # noqa: S105
    s3_bucket: str = "topaz-media"

    # Public site constants served by GET /config
    whatsapp_number: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
