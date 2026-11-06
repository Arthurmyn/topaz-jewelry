"""Generic admin CRUD router factory (list/get/create/update/delete).

Shared admin conventions: ?page, ?page_size, ?sort=field|-field, ?q=<search>.
"""

from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.core.db import Base
from app.core.errors import ApiError, not_found
from app.modules.auth.deps import DbSession, require_admin


class Page(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int


def crud_router(
    *,
    prefix: str,
    model: type[Base],
    out: type[BaseModel],
    create: type[BaseModel],
    update: type[BaseModel],
    search_fields: tuple[str, ...] = (),
    default_sort: str = "id",
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=["admin"], dependencies=[Depends(require_admin)])
    columns = model.__table__.columns

    @router.get("")
    async def list_items(
        db: DbSession,
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 25,
        sort: str = default_sort,
        q: str | None = None,
    ) -> dict[str, Any]:
        desc = sort.startswith("-")
        col = columns.get(sort.lstrip("-"))
        if col is None:
            raise ApiError(422, "bad_sort", "Unknown sort field")
        stmt = select(model)
        if q and search_fields:
            haystack = func.concat_ws(" ", *[columns[f] for f in search_fields])
            stmt = stmt.where(haystack.ilike(f"%{q}%"))
        total = await db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        stmt = (
            stmt.order_by(col.desc() if desc else col.asc())
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        rows = (await db.scalars(stmt)).all()
        return {
            "items": [out.model_validate(r, from_attributes=True) for r in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @router.get("/{item_id}", response_model=out)
    async def get_item(item_id: int, db: DbSession) -> Any:
        row = await db.get(model, item_id)
        if row is None:
            raise not_found()
        return row

    @router.post("", response_model=out, status_code=201)
    async def create_item(body: create, db: DbSession) -> Any:  # type: ignore[valid-type]
        row = model(**cast(BaseModel, body).model_dump())
        db.add(row)
        try:
            await db.flush()
        except IntegrityError as exc:
            raise ApiError(409, "conflict", "Conflict", "Duplicate or invalid value") from exc
        return row

    @router.patch("/{item_id}", response_model=out)
    async def update_item(item_id: int, body: update, db: DbSession) -> Any:  # type: ignore[valid-type]
        row = await db.get(model, item_id)
        if row is None:
            raise not_found()
        for key, value in cast(BaseModel, body).model_dump(exclude_unset=True).items():
            setattr(row, key, value)
        try:
            await db.flush()
        except IntegrityError as exc:
            raise ApiError(409, "conflict", "Conflict", "Duplicate or invalid value") from exc
        return row

    @router.delete("/{item_id}", status_code=204)
    async def delete_item(item_id: int, db: DbSession) -> None:
        row = await db.get(model, item_id)
        if row is None:
            raise not_found()
        try:
            await db.delete(row)
            await db.flush()
        except IntegrityError as exc:
            raise ApiError(
                409, "in_use", "Conflict", "Item is referenced by other records"
            ) from exc

    return router
