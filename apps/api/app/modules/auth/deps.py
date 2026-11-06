"""Auth and CSRF dependencies."""

import secrets
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.errors import ApiError
from app.modules.auth import service
from app.modules.auth.models import User

SESSION_COOKIE = "topaz_session"
CSRF_COOKIE = "topaz_csrf"
CSRF_HEADER = "x-csrf-token"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CSRF_EXEMPT_PREFIXES = ("/api/v1/webhooks/",)

DbSession = Annotated[AsyncSession, Depends(get_session)]


async def csrf_protect(request: Request) -> None:
    """Double-submit cookie check on every unsafe request (webhooks use signatures instead)."""
    if request.method in SAFE_METHODS or request.url.path.startswith(CSRF_EXEMPT_PREFIXES):
        return
    cookie = request.cookies.get(CSRF_COOKIE)
    header = request.headers.get(CSRF_HEADER)
    if not cookie or not header or not secrets.compare_digest(cookie, header):
        raise ApiError(403, "csrf_failed", "CSRF token missing or invalid")


async def current_user_optional(request: Request, db: DbSession) -> User | None:
    token = request.cookies.get(SESSION_COOKIE)
    return await service.user_for_token(db, token) if token else None


async def require_user(user: Annotated[User | None, Depends(current_user_optional)]) -> User:
    if user is None:
        raise ApiError(401, "unauthenticated", "Authentication required")
    return user


async def require_admin(user: Annotated[User, Depends(require_user)]) -> User:
    if user.role != "admin":
        raise ApiError(403, "forbidden", "Admin access required")
    return user
