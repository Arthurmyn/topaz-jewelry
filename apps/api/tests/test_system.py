from httpx import AsyncClient


async def test_health(client: AsyncClient) -> None:
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": True, "redis": True}


async def test_public_config_exposes_flags(client: AsyncClient) -> None:
    r = await client.get("/api/v1/config")
    assert r.json()["features"] == {"accounts": False, "payments": False}
    assert r.json()["currency"] == "KZT"


async def test_validation_error_format(client: AsyncClient) -> None:
    r = await client.get("/api/v1/products", params={"page": 0})
    assert r.status_code == 422
    assert r.json()["code"] == "validation_error"
