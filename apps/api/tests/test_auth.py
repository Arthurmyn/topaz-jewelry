from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import with_csrf
from tests.factories import make_user

PASSWORD = "correct-horse-battery"


async def test_csrf_required_on_unsafe_requests(client: AsyncClient) -> None:
    r = await client.post("/api/v1/auth/login", json={"email": "a@b.kz", "password": "x"})
    assert r.status_code == 403
    assert r.json()["code"] == "csrf_failed"


async def test_admin_login_session_and_logout(client: AsyncClient, db: AsyncSession) -> None:
    await make_user(db, "admin@topaz.kz", PASSWORD, role="admin")
    await db.commit()
    headers = await with_csrf(client)

    bad = await client.post(
        "/api/v1/auth/login", json={"email": "admin@topaz.kz", "password": "wrong"}, headers=headers
    )
    assert bad.status_code == 401

    ok = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@topaz.kz", "password": PASSWORD},
        headers=headers,
    )
    assert ok.status_code == 200
    assert "httponly" in ok.headers["set-cookie"].lower()
    assert (await client.get("/api/v1/auth/me")).json()["role"] == "admin"

    await client.post("/api/v1/auth/logout", headers=headers)
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_customer_cannot_login_when_accounts_off(
    client: AsyncClient, db: AsyncSession
) -> None:
    await make_user(db, "c@topaz.kz", PASSWORD)
    await db.commit()
    headers = await with_csrf(client)
    r = await client.post(
        "/api/v1/auth/login", json={"email": "c@topaz.kz", "password": PASSWORD}, headers=headers
    )
    assert r.status_code == 404
    reg = await client.post(
        "/api/v1/auth/register", json={"email": "n@topaz.kz", "password": PASSWORD}, headers=headers
    )
    assert reg.status_code == 404


async def test_register_and_login_when_accounts_on(client: AsyncClient, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setattr("app.core.features.get_settings", lambda: _settings(accounts=True))
    monkeypatch.setattr("app.modules.auth.router.get_features", _features_on)
    headers = await with_csrf(client)
    r = await client.post(
        "/api/v1/auth/register", json={"email": "n@topaz.kz", "password": PASSWORD}, headers=headers
    )
    assert r.status_code == 201
    assert (await client.get("/api/v1/auth/me")).json()["email"] == "n@topaz.kz"


def _settings(accounts: bool):  # type: ignore[no-untyped-def]
    from app.core.config import get_settings

    s = get_settings().model_copy(update={"feature_accounts": accounts})
    return s


def _features_on():  # type: ignore[no-untyped-def]
    from app.core.features import Features

    return Features(accounts=True, payments=False)


async def test_admin_endpoints_require_admin_role(
    client: AsyncClient, db: AsyncSession, monkeypatch
) -> None:  # type: ignore[no-untyped-def]
    assert (await client.get("/api/v1/admin/categories")).status_code == 401
    monkeypatch.setattr("app.modules.auth.router.get_features", _features_on)
    await make_user(db, "c@topaz.kz", PASSWORD)
    await db.commit()
    headers = await with_csrf(client)
    login = await client.post(
        "/api/v1/auth/login", json={"email": "c@topaz.kz", "password": PASSWORD}, headers=headers
    )
    assert login.status_code == 200
    assert (await client.get("/api/v1/admin/categories")).status_code == 403
