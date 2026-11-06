from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import with_csrf
from tests.factories import make_user

PASSWORD = "correct-horse-battery"


async def _login_admin(client: AsyncClient, db: AsyncSession) -> dict[str, str]:
    await make_user(db, "admin@topaz.kz", PASSWORD, role="admin")
    await db.commit()
    headers = await with_csrf(client)
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@topaz.kz", "password": PASSWORD},
        headers=headers,
    )
    assert r.status_code == 200
    return headers


async def test_category_crud(client: AsyncClient, db: AsyncSession) -> None:
    h = await _login_admin(client, db)
    created = await client.post(
        "/api/v1/admin/categories", json={"slug": "kolye", "name": "Колье"}, headers=h
    )
    assert created.status_code == 201
    cid = created.json()["id"]

    dup = await client.post(
        "/api/v1/admin/categories", json={"slug": "kolye", "name": "Другое"}, headers=h
    )
    assert dup.status_code == 409

    upd = await client.patch(
        f"/api/v1/admin/categories/{cid}", json={"name": "Колье и шейные"}, headers=h
    )
    assert upd.json()["name"] == "Колье и шейные"

    listing = await client.get("/api/v1/admin/categories", params={"q": "колье"})
    assert listing.json()["total"] == 1

    assert (await client.delete(f"/api/v1/admin/categories/{cid}", headers=h)).status_code == 204
    assert (await client.get(f"/api/v1/admin/categories/{cid}")).status_code == 404


async def test_admin_requires_csrf(client: AsyncClient, db: AsyncSession) -> None:
    h = await _login_admin(client, db)
    r = await client.post("/api/v1/admin/stones", json={"slug": "x", "name": "X"})
    assert r.status_code == 403
    r = await client.post("/api/v1/admin/stones", json={"slug": "x", "name": "X"}, headers=h)
    assert r.status_code == 201
