"""Idempotent seed: creates categories, stones, stores, 20 products with placeholder images."""

import asyncio
import colorsys
import hashlib
import io
from datetime import UTC, datetime, timedelta

from PIL import Image, ImageDraw
from sqlalchemy import func, select

from app.core.db import get_sessionmaker
from app.core.images import build_variants
from app.core.money import MINOR_PER_UNIT
from app.core.storage import put_object
from app.modules.catalog.models import (
    Category,
    Product,
    ProductImage,
    ProductStone,
    ProductVariant,
    Stone,
)
from app.modules.content.models import StoreLocation
from app.seed.data import CATEGORIES, PRODUCTS, STONES, STORES


def placeholder_image(seed: str, size: int = 1600) -> bytes:
    """Soft gradient with a ring: a stand-in for a product photo."""
    h = int(hashlib.md5(seed.encode(), usedforsecurity=False).hexdigest()[:4], 16) / 65535  # noqa: S324
    top = tuple(int(c * 255) for c in colorsys.hsv_to_rgb(h, 0.12, 0.97))
    bottom = tuple(int(c * 255) for c in colorsys.hsv_to_rgb(h, 0.30, 0.82))
    img = Image.new("RGB", (size, size), top)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        draw.line(
            [(0, y), (size, y)],
            fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom, strict=True)),
        )
    m = size // 4
    ring = tuple(int(c * 0.55) for c in bottom)
    draw.ellipse([m, m, size - m, size - m], outline=ring, width=size // 28)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def upload_images(base_key: str, data: bytes) -> tuple[int, int]:
    variants, size = build_variants(data)
    for name, blob in variants.items():
        ctype = "image/avif" if name.endswith(".avif") else "image/webp"
        put_object(f"{base_key}/{name}", blob, ctype)
    return size


async def run_seed() -> None:
    async with get_sessionmaker()() as db:
        if await db.scalar(select(func.count()).select_from(Category)):
            print("Catalog is not empty: seed skipped")  # noqa: T201
            return

        cats: dict[str, Category] = {}
        for slug, name, parent, sort in CATEGORIES:
            cat = Category(
                slug=slug, name=name, sort_order=sort, parent_id=cats[parent].id if parent else None
            )
            db.add(cat)
            await db.flush()
            cats[slug] = cat

        stones = {slug: Stone(slug=slug, name=name) for slug, name in STONES}
        db.add_all(stones.values())
        db.add_all(StoreLocation(**s) for s in STORES)
        await db.flush()

        now = datetime.now(UTC)
        for i, p in enumerate(PRODUCTS):
            product = Product(
                slug=p.slug,
                name=p.name,
                description=p.description,
                category_id=cats[p.category].id,
                metal=p.metal,
                gold_color=p.color,
                purity=p.purity,
                weight_g=p.weight,
                published_at=now - timedelta(days=i),
            )
            db.add(product)
            await db.flush()
            for n, (size, price, stock) in enumerate(p.variants, start=1):
                db.add(
                    ProductVariant(
                        product_id=product.id,
                        sku=f"{p.slug[:40]}-{n}",
                        size=size,
                        weight_g=p.weight,
                        price_minor=price * MINOR_PER_UNIT,
                        stock_qty=stock,
                    )
                )
            for stone_slug, count, carat in p.stones:
                db.add(
                    ProductStone(
                        product_id=product.id,
                        stone_id=stones[stone_slug].id,
                        count=count,
                        carat=carat or None,
                    )
                )
            base_key = f"products/{product.id}/main"
            width, height = await asyncio.to_thread(
                upload_images, base_key, placeholder_image(p.slug)
            )
            db.add(
                ProductImage(
                    product_id=product.id,
                    storage_key=base_key,
                    alt=p.name,
                    width=width,
                    height=height,
                    is_primary=True,
                )
            )
        await db.commit()
        print(f"Seeded {len(PRODUCTS)} products")  # noqa: T201
