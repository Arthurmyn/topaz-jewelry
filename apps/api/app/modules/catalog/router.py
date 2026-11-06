from typing import Annotated

from fastapi import APIRouter, Query

from app.modules.auth.deps import DbSession
from app.modules.catalog import service
from app.modules.catalog.schemas import (
    CategoryOut,
    ProductDetail,
    ProductFilters,
    ProductListItem,
    ProductPage,
)

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
async def categories(db: DbSession) -> list[CategoryOut]:
    return await service.category_tree(db)


@router.get("/products", response_model=ProductPage)
async def products(filters: Annotated[ProductFilters, Query()], db: DbSession) -> ProductPage:
    return await service.list_products(db, filters)


@router.get("/products/{slug}", response_model=ProductDetail)
async def product(slug: str, db: DbSession) -> ProductDetail:
    return await service.get_product(db, slug)


@router.get("/products/{slug}/related", response_model=list[ProductListItem])
async def related(slug: str, db: DbSession) -> list[ProductListItem]:
    return await service.related_products(db, slug)
