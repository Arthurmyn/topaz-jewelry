"""System endpoints: health and public config."""

import structlog
from fastapi import APIRouter, Request, Response
from pydantic import BaseModel
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import get_engine
from app.core.features import Features, get_features
from app.core.money import CURRENCY

log = structlog.get_logger()
router = APIRouter(tags=["system"])


class HealthOut(BaseModel):
    status: str
    db: bool
    redis: bool


class PublicConfig(BaseModel):
    features: Features
    currency: str
    whatsapp_number: str


@router.get("/health", response_model=HealthOut)
async def health(request: Request, response: Response) -> HealthOut:
    db_ok = redis_ok = False
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:  # noqa: BLE001 - health must never raise
        log.warning("health_db_failed")
    try:
        redis_ok = bool(await request.app.state.redis.ping())
    except Exception:  # noqa: BLE001
        log.warning("health_redis_failed")
    ok = db_ok and redis_ok
    if not ok:
        response.status_code = 503
    return HealthOut(status="ok" if ok else "degraded", db=db_ok, redis=redis_ok)


@router.get("/config", response_model=PublicConfig)
async def public_config() -> PublicConfig:
    s = get_settings()
    return PublicConfig(
        features=get_features(), currency=CURRENCY, whatsapp_number=s.whatsapp_number
    )
