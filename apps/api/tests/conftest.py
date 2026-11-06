import os

# Must run before the app is imported: point the app at the test database.
os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["FEATURE_ACCOUNTS"] = "false"
os.environ["FEATURE_PAYMENTS"] = "false"

from collections.abc import AsyncIterator  # noqa: E402

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from redis.asyncio import Redis  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession  # noqa: E402

from app import models  # noqa: E402,F401
from app.core.config import get_settings  # noqa: E402
from app.core.db import Base, get_engine, get_sessionmaker  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
async def _schema() -> AsyncIterator[None]:
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.fixture(autouse=True)
async def _clean() -> AsyncIterator[None]:
    yield
    tables = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)
    async with get_engine().begin() as conn:
        await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
async def db() -> AsyncIterator[AsyncSession]:
    async with get_sessionmaker()() as session:
        yield session


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    app.state.redis = Redis.from_url(get_settings().redis_url, decode_responses=True)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    await app.state.redis.aclose()


async def with_csrf(client: AsyncClient) -> dict[str, str]:
    """Fetch a CSRF token (cookie is stored on the client) and return the matching header."""
    r = await client.get("/api/v1/auth/csrf")
    return {"X-CSRF-Token": r.json()["csrf_token"]}
