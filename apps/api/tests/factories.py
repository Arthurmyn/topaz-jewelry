"""Small helpers to create catalog data in tests."""

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.service import create_user
from app.modules.catalog.models import Category, Product, ProductStone, ProductVariant, Stone


async def make_category(
    db: AsyncSession, slug: str = "koltsa", parent_id: int | None = None
) -> Category:
    cat = Category(slug=slug, name=slug.title(), parent_id=parent_id)
    db.add(cat)
    await db.flush()
    return cat


async def make_stone(db: AsyncSession, slug: str = "topaz") -> Stone:
    stone = Stone(slug=slug, name=slug.title())
    db.add(stone)
    await db.flush()
    return stone


async def make_product(
    db: AsyncSession,
    category: Category,
    slug: str,
    *,
    metal: str = "gold",
    purity: int = 585,
    price_kzt: int = 100000,
    stock: int = 1,
    stone: Stone | None = None,
    name: str | None = None,
) -> Product:
    p = Product(
        slug=slug,
        name=name or slug,
        category_id=category.id,
        metal=metal,
        purity=purity,
        published_at=datetime.now(UTC),
    )
    db.add(p)
    await db.flush()
    db.add(
        ProductVariant(
            product_id=p.id, sku=f"{slug}-1", price_minor=price_kzt * 100, stock_qty=stock
        )
    )
    if stone:
        db.add(ProductStone(product_id=p.id, stone_id=stone.id))
    await db.flush()
    return p


async def make_user(db: AsyncSession, email: str, password: str, role: str = "customer") -> None:
    await create_user(db, email=email, password=password, role=role)
