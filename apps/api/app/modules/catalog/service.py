from typing import Any

from sqlalchemy import ColumnElement, Select, Subquery, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import not_found
from app.core.money import kzt_to_minor
from app.modules.catalog.models import (
    Category,
    Product,
    ProductStone,
    ProductVariant,
    Stone,
)
from app.modules.catalog.schemas import (
    CategoryOut,
    Facets,
    FacetValue,
    ImageOut,
    ProductDetail,
    ProductFilters,
    ProductListItem,
    ProductPage,
    StoneRef,
    VariantOut,
)

METAL_LABELS = {"gold": "Золото", "silver": "Серебро", "platinum": "Платина"}


def _variant_agg() -> Subquery:
    """Per-product price/availability aggregate over active variants."""
    return (
        select(
            ProductVariant.product_id.label("product_id"),
            func.min(ProductVariant.price_minor).label("price_from"),
            func.sum(ProductVariant.stock_qty - ProductVariant.reserved_qty).label("available"),
        )
        .where(ProductVariant.is_active)
        .group_by(ProductVariant.product_id)
        .subquery()
    )


_ITEM_OPTIONS = (
    selectinload(Product.images),
    selectinload(Product.category),
    selectinload(Product.product_stones).selectinload(ProductStone.stone),
)


def _to_item(p: Product, price_from: int, available: int | None) -> ProductListItem:
    return ProductListItem(
        slug=p.slug,
        name=p.name,
        category_slug=p.category.slug,
        metal=p.metal,
        purity=p.purity,
        price_from_minor=price_from,
        in_stock=(available or 0) > 0,
        image=ImageOut.model_validate(p.images[0]) if p.images else None,
        stones=[StoneRef(slug=ps.stone.slug, name=ps.stone.name) for ps in p.product_stones],
    )


async def category_tree(db: AsyncSession) -> list[CategoryOut]:
    rows = (
        await db.scalars(
            select(Category).where(Category.is_active).order_by(Category.sort_order, Category.name)
        )
    ).all()
    nodes = {c.id: CategoryOut.model_validate(c) for c in rows}
    roots: list[CategoryOut] = []
    for c in rows:
        node = nodes[c.id]
        if c.parent_id and c.parent_id in nodes:
            nodes[c.parent_id].children.append(node)
        else:
            roots.append(node)
    return roots


async def _category_ids(db: AsyncSession, slug: str) -> list[int]:
    cat = await db.scalar(select(Category).where(Category.slug == slug, Category.is_active))
    if cat is None:
        return []
    children = await db.scalars(select(Category.id).where(Category.parent_id == cat.id))
    return [cat.id, *children.all()]


def _base(agg: Subquery, *cols: Any, conds: list[ColumnElement[bool]]) -> Select[Any]:
    return (
        select(*cols).select_from(Product).join(agg, agg.c.product_id == Product.id).where(*conds)
    )


def _conditions(
    f: ProductFilters, agg: Subquery, category_ids: list[int] | None
) -> list[ColumnElement[bool]]:
    conds: list[ColumnElement[bool]] = [Product.is_active.is_(True)]
    if category_ids is not None:
        conds.append(Product.category_id.in_(category_ids))
    if f.metal:
        conds.append(Product.metal.in_(f.metal))
    if f.purity:
        conds.append(Product.purity.in_(f.purity))
    if f.stone:
        conds.append(
            Product.id.in_(
                select(ProductStone.product_id)
                .join(Stone, Stone.id == ProductStone.stone_id)
                .where(Stone.slug.in_(f.stone))
            )
        )
    if f.price_min is not None:
        conds.append(agg.c.price_from >= kzt_to_minor(f.price_min))
    if f.price_max is not None:
        conds.append(agg.c.price_from <= kzt_to_minor(f.price_max))
    if f.in_stock:
        conds.append(agg.c.available > 0)
    if f.q:
        conds.append(Product.name.ilike(f"%{f.q.strip()}%"))
    return conds


async def list_products(db: AsyncSession, f: ProductFilters) -> ProductPage:
    agg = _variant_agg()
    category_ids: list[int] | None = None
    if f.category:
        category_ids = await _category_ids(db, f.category)
        if not category_ids:
            return ProductPage(items=[], total=0, page=f.page, page_size=f.page_size)
    conds = _conditions(f, agg, category_ids)

    total = await db.scalar(_base(agg, func.count(Product.id), conds=conds)) or 0

    orders: dict[str, list[Any]] = {
        "newest": [Product.published_at.desc().nulls_last(), Product.id.desc()],
        "price_asc": [agg.c.price_from.asc(), Product.id],
        "price_desc": [agg.c.price_from.desc(), Product.id],
    }
    order = orders[f.sort]
    stmt = (
        _base(agg, Product, agg.c.price_from, agg.c.available, conds=conds)
        .options(*_ITEM_OPTIONS)
        .order_by(*order)
        .limit(f.page_size)
        .offset((f.page - 1) * f.page_size)
    )
    items = [_to_item(p, price, avail) for p, price, avail in (await db.execute(stmt)).all()]
    facets = await _facets(db, agg, conds) if f.include == "facets" else None
    return ProductPage(items=items, total=total, page=f.page, page_size=f.page_size, facets=facets)


async def _facets(db: AsyncSession, agg: Subquery, conds: list[ColumnElement[bool]]) -> Facets:
    ids = _base(agg, Product.id, conds=conds).scalar_subquery()
    metal_rows = (
        await db.execute(
            select(Product.metal, func.count()).where(Product.id.in_(ids)).group_by(Product.metal)
        )
    ).all()
    purity_rows = (
        await db.execute(
            select(Product.purity, func.count())
            .where(Product.id.in_(ids))
            .group_by(Product.purity)
            .order_by(Product.purity)
        )
    ).all()
    stone_rows = (
        await db.execute(
            select(Stone.slug, Stone.name, func.count(distinct(ProductStone.product_id)))
            .join(ProductStone, ProductStone.stone_id == Stone.id)
            .where(ProductStone.product_id.in_(ids))
            .group_by(Stone.slug, Stone.name)
            .order_by(Stone.name)
        )
    ).all()
    price = (
        await db.execute(
            _base(
                agg,
                func.min(agg.c.price_from),
                func.max(agg.c.price_from),
                conds=conds,
            )
        )
    ).one()
    return Facets(
        metal=[FacetValue(value=m, label=METAL_LABELS.get(m, m), count=c) for m, c in metal_rows],
        purity=[FacetValue(value=str(p), label=str(p), count=c) for p, c in purity_rows],
        stone=[FacetValue(value=s, label=n, count=c) for s, n, c in stone_rows],
        price_min_minor=price[0],
        price_max_minor=price[1],
    )


async def get_product(db: AsyncSession, slug: str) -> ProductDetail:
    product = await db.scalar(
        select(Product)
        .where(Product.slug == slug, Product.is_active)
        .options(
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.variants),
            selectinload(Product.product_stones).selectinload(ProductStone.stone),
        )
    )
    if product is None:
        raise not_found("product")
    return ProductDetail(
        slug=product.slug,
        name=product.name,
        description=product.description,
        category_slug=product.category.slug,
        category_name=product.category.name,
        metal=product.metal,
        gold_color=product.gold_color,
        purity=product.purity,
        weight_g=product.weight_g,
        variants=[
            VariantOut(
                sku=v.sku,
                size=v.size,
                weight_g=v.weight_g,
                price_minor=v.price_minor,
                old_price_minor=v.old_price_minor,
                available_qty=max(v.stock_qty - v.reserved_qty, 0),
            )
            for v in product.variants
            if v.is_active
        ],
        images=[ImageOut.model_validate(i) for i in product.images],
        stones=[StoneRef(slug=ps.stone.slug, name=ps.stone.name) for ps in product.product_stones],
    )


async def related_products(db: AsyncSession, slug: str, limit: int = 4) -> list[ProductListItem]:
    product = await db.scalar(select(Product).where(Product.slug == slug, Product.is_active))
    if product is None:
        raise not_found("product")
    agg = _variant_agg()
    conds = [*_conditions(ProductFilters(), agg, [product.category_id]), Product.id != product.id]
    stmt = (
        _base(agg, Product, agg.c.price_from, agg.c.available, conds=conds)
        .options(*_ITEM_OPTIONS)
        .order_by(Product.published_at.desc().nulls_last())
        .limit(limit)
    )
    return [_to_item(p, price, avail) for p, price, avail in (await db.execute(stmt)).all()]
