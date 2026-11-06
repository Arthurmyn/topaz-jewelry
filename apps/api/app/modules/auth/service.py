from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.security import hash_password, hash_token, new_token, verify_password
from app.modules.auth.models import Session, User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    return await db.scalar(select(User).where(User.email == email))


async def create_user(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    role: str = "customer",
    first_name: str | None = None,
) -> User:
    if await get_user_by_email(db, email):
        raise ApiError(409, "email_taken", "Email already registered")
    user = User(
        email=email, password_hash=hash_password(password), role=role, first_name=first_name
    )
    db.add(user)
    await db.flush()
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)
    ok = verify_password(password, user.password_hash if user else None)
    if not user or not ok or not user.is_active:
        raise ApiError(401, "invalid_credentials", "Invalid email or password")
    return user


async def create_session(
    db: AsyncSession, user: User, *, ip: str | None, user_agent: str | None
) -> tuple[str, int]:
    """Return (raw token, max-age seconds). Only the hash is stored."""
    s = get_settings()
    hours = s.session_hours_admin if user.role == "admin" else s.session_hours_customer
    token = new_token()
    db.add(
        Session(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=datetime.now(UTC) + timedelta(hours=hours),
            ip=ip,
            user_agent=(user_agent or "")[:300],
        )
    )
    await db.flush()
    return token, hours * 3600


async def user_for_token(db: AsyncSession, token: str) -> User | None:
    row = await db.execute(
        select(User)
        .join(Session, Session.user_id == User.id)
        .where(Session.token_hash == hash_token(token), Session.expires_at > datetime.now(UTC))
    )
    user = row.scalar_one_or_none()
    return user if user and user.is_active else None


async def delete_session(db: AsyncSession, token: str) -> None:
    await db.execute(delete(Session).where(Session.token_hash == hash_token(token)))
