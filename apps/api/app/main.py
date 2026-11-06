from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from redis.asyncio import Redis

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import add_request_id_middleware, setup_logging
from app.core.system import router as system_router
from app.modules.admin.router import router as admin_router
from app.modules.auth.deps import csrf_protect
from app.modules.auth.router import router as auth_router
from app.modules.catalog.router import router as catalog_router
from app.modules.content.router import router as content_router
from app.modules.payments.router import router as payments_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.redis = Redis.from_url(get_settings().redis_url, decode_responses=True)
    yield
    await app.state.redis.aclose()


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(settings.env)
    app = FastAPI(
        title="Topaz Jewelry API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/api/docs" if settings.env != "production" else None,
        openapi_url="/api/openapi.json",
        dependencies=[Depends(csrf_protect)],
    )
    add_request_id_middleware(app)
    register_error_handlers(app)

    v1 = APIRouter(prefix="/api/v1")
    for r in (
        system_router,
        auth_router,
        catalog_router,
        content_router,
        payments_router,
        admin_router,
    ):
        v1.include_router(r)
    app.include_router(v1)
    return app


app = create_app()
