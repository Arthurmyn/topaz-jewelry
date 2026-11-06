from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from redis.asyncio import Redis

from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.features import get_features, require_feature
from app.core.ratelimit import client_ip, hit
from app.core.security import new_token
from app.modules.auth import service
from app.modules.auth.deps import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    DbSession,
    current_user_optional,
    require_user,
)
from app.modules.auth.models import User
from app.modules.auth.schemas import CsrfOut, LoginIn, RegisterIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _redis(request: Request) -> Redis:
    return request.app.state.redis  # type: ignore[no-any-return]


def _set_session_cookie(response: Response, token: str, max_age: int) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=max_age,
        httponly=True,
        secure=get_settings().cookie_secure,
        samesite="lax",
        path="/",
    )


@router.get("/csrf", response_model=CsrfOut)
async def csrf(request: Request, response: Response) -> CsrfOut:
    """Issue (or re-use) the double-submit CSRF token."""
    token = request.cookies.get(CSRF_COOKIE) or new_token()
    response.set_cookie(
        CSRF_COOKIE,
        token,
        httponly=False,
        secure=get_settings().cookie_secure,
        samesite="lax",
        path="/",
    )
    return CsrfOut(csrf_token=token)


@router.post("/login", response_model=UserOut)
async def login(body: LoginIn, request: Request, response: Response, db: DbSession) -> User:
    redis = _redis(request)
    await hit(redis, f"login:ip:{client_ip(request)}", 20, 60)
    await hit(redis, f"login:email:{body.email.lower()}", 5, 60)
    user = await service.authenticate(db, body.email, body.password)
    # Customers may log in only when accounts are enabled; admins always can.
    if user.role != "admin" and not get_features().accounts:
        raise ApiError(404, "feature_disabled", "Not found")
    token, max_age = await service.create_session(
        db, user, ip=client_ip(request), user_agent=request.headers.get("user-agent")
    )
    _set_session_cookie(response, token, max_age)
    return user


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response, db: DbSession) -> None:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        await service.delete_session(db, token)
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(require_user)]) -> User:
    return user


@router.get("/session", response_model=UserOut | None)
async def session(user: Annotated[User | None, Depends(current_user_optional)]) -> User | None:
    """Like /me but returns null instead of 401 (convenient for the UI)."""
    return user


@router.post(
    "/register",
    response_model=UserOut,
    status_code=201,
    dependencies=[Depends(require_feature("accounts"))],
)
async def register(body: RegisterIn, request: Request, response: Response, db: DbSession) -> User:
    await hit(_redis(request), f"register:ip:{client_ip(request)}", 5, 3600)
    user = await service.create_user(
        db, email=body.email, password=body.password, first_name=body.first_name
    )
    token, max_age = await service.create_session(
        db, user, ip=client_ip(request), user_agent=request.headers.get("user-agent")
    )
    _set_session_cookie(response, token, max_age)
    return user
