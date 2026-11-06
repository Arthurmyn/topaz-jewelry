"""Uniform error format (RFC 7807 style) with stable machine-readable codes."""

from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

log = structlog.get_logger()


class ApiError(Exception):
    def __init__(self, status: int, code: str, title: str, detail: str | None = None) -> None:
        self.status = status
        self.code = code
        self.title = title
        self.detail = detail


def not_found(what: str = "resource") -> ApiError:
    return ApiError(404, "not_found", "Not found", f"{what} not found")


def _body(
    status: int, code: str, title: str, detail: str | None = None, errors: Any = None
) -> dict[str, Any]:
    body: dict[str, Any] = {"status": status, "code": code, "title": title, "detail": detail}
    if errors is not None:
        body["errors"] = errors
    return body


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error(_: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(_body(exc.status, exc.code, exc.title, exc.detail), exc.status)

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [
            {"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            _body(422, "validation_error", "Validation error", errors=errors), status_code=422
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            _body(exc.status_code, "http_error", str(exc.detail)), status_code=exc.status_code
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        log.exception("unhandled_error", path=request.url.path)
        request_id = getattr(request.state, "request_id", None)
        return JSONResponse(
            _body(500, "internal_error", "Internal server error", request_id), status_code=500
        )
