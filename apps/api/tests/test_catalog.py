from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import make_category, make_product, make_stone


async def _seed(db: AsyncSession) -> None:
    rings = await make_category(db, "koltsa")
    await make_category(db, "obruchalnye", parent_id=rings.id)
    earrings = await make_category(db, "sergi")
    topaz = await make_stone(db, "topaz")
    await make_product(db, rings, "r1", price_kzt=100000, stone=topaz, name="Кольцо с топазом")
    await make_product(db, rings, "r2", purity=750, price_kzt=300000, stock=0)
    await make_product(db, earrings, "e1", metal="silver", purity=925, price_kzt=20000)
    await db.commit()


async def test_list_all(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    body = (await client.get("/api/v1/products")).json()
    assert body["total"] == 3
    assert {i["slug"] for i in body["items"]} == {"r1", "r2", "e1"}


async def test_filter_category_metal_purity_stone(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    get = lambda **p: client.get("/api/v1/products", params=p)  # noqa: E731
    assert (await get(category="koltsa")).json()["total"] == 2
    assert (await get(metal="silver")).json()["total"] == 1
    assert (await get(purity=[585, 750])).json()["total"] == 2
    assert [i["slug"] for i in (await get(stone="topaz")).json()["items"]] == ["r1"]


async def test_filter_price_in_kzt_and_stock(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    r = await client.get("/api/v1/products", params={"price_min": 50000, "price_max": 150000})
    assert [i["slug"] for i in r.json()["items"]] == ["r1"]
    r = await client.get("/api/v1/products", params={"in_stock": True})
    assert {i["slug"] for i in r.json()["items"]} == {"r1", "e1"}


async def test_sort_and_pagination(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    r = await client.get("/api/v1/products", params={"sort": "price_desc", "page_size": 2})
    body = r.json()
    assert [i["slug"] for i in body["items"]] == ["r2", "r1"]
    assert body["total"] == 3
    assert body["items"][0]["price_from_minor"] == 30000000


async def test_search_and_facets(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    r = await client.get("/api/v1/products", params={"q": "топаз", "include": "facets"})
    body = r.json()
    assert body["total"] == 1
    assert body["facets"]["stone"][0]["value"] == "topaz"
    r = await client.get("/api/v1/products", params={"include": "facets"})
    assert {f["value"] for f in r.json()["facets"]["metal"]} == {"gold", "silver"}


async def test_product_detail_and_404(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    r = await client.get("/api/v1/products/r1")
    assert r.status_code == 200
    assert r.json()["variants"][0]["available_qty"] == 1
    r = await client.get("/api/v1/products/nope")
    assert r.status_code == 404
    assert r.json()["code"] == "not_found"


async def test_category_tree(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    tree = (await client.get("/api/v1/categories")).json()
    rings = next(c for c in tree if c["slug"] == "koltsa")
    assert [c["slug"] for c in rings["children"]] == ["obruchalnye"]


async def test_related(client: AsyncClient, db: AsyncSession) -> None:
    await _seed(db)
    r = await client.get("/api/v1/products/r1/related")
    assert [i["slug"] for i in r.json()] == ["r2"]
