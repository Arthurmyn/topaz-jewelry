from fastapi import APIRouter
from sqlalchemy import select

from app.core.errors import not_found
from app.modules.auth.deps import DbSession
from app.modules.content.models import StoreLocation
from app.modules.content.schemas import StoreOut

router = APIRouter(tags=["content"])


@router.get("/stores", response_model=list[StoreOut])
async def stores(db: DbSession) -> list[StoreLocation]:
    rows = await db.scalars(
        select(StoreLocation).where(StoreLocation.is_active).order_by(StoreLocation.city)
    )
    return list(rows)


@router.get("/stores/{slug}", response_model=StoreOut)
async def store(slug: str, db: DbSession) -> StoreLocation:
    row = await db.scalar(
        select(StoreLocation).where(StoreLocation.slug == slug, StoreLocation.is_active)
    )
    if row is None:
        raise not_found("store")
    return row
