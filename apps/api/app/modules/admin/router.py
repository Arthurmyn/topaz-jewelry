"""Admin routers. Register a new resource by adding one crud_router(...) call here."""

from fastapi import APIRouter

from app.modules.admin import schemas as s
from app.modules.admin.crud import crud_router
from app.modules.catalog.models import Category, Stone
from app.modules.content.models import StoreLocation

router = APIRouter(prefix="/admin")

router.include_router(
    crud_router(
        prefix="/categories",
        model=Category,
        out=s.CategoryAdminOut,
        create=s.CategoryCreate,
        update=s.CategoryUpdate,
        search_fields=("name", "slug"),
    )
)
router.include_router(
    crud_router(
        prefix="/stones",
        model=Stone,
        out=s.StoneAdminOut,
        create=s.StoneCreate,
        update=s.StoneUpdate,
        search_fields=("name", "slug"),
    )
)
router.include_router(
    crud_router(
        prefix="/stores",
        model=StoreLocation,
        out=s.StoreAdminOut,
        create=s.StoreCreate,
        update=s.StoreUpdate,
        search_fields=("name", "city", "address"),
    )
)
