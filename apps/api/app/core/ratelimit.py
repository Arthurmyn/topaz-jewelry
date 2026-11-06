"""Fixed-window rate limiting on Redis."""

from fastapi import Request
from redis.asyncio import Redis

from app.core.config import get_settings
from app.core.errors import ApiError


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


async def hit(redis: Redis, key: str, limit: int, window_s: int) -> None:
    """Count one hit; raise 429 when over the limit."""
    if not get_settings().rate_limit_enabled:
        return
    redis_key = f"rl:{key}"
    count = await redis.incr(redis_key)
    if count == 1:
        await redis.expire(redis_key, window_s)
    if count > limit:
        raise ApiError(429, "rate_limited", "Too many requests")
