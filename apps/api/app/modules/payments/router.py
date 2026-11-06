"""Webhook endpoint skeleton.

Full processing (payments table, order transitions) arrives with the orders module.
"""

from fastapi import APIRouter, Request

from app.core.errors import ApiError
from app.modules.payments.interface import InvalidSignatureError
from app.modules.payments.registry import get_provider

router = APIRouter(tags=["payments"])


@router.post("/webhooks/payments/{provider}", status_code=200)
async def payment_webhook(provider: str, request: Request) -> dict[str, bool]:
    try:
        impl = get_provider(provider)
    except ValueError:
        raise ApiError(404, "unknown_provider", "Not found") from None
    raw = await request.body()
    try:
        impl.parse_webhook(dict(request.headers), raw)
    except InvalidSignatureError:
        raise ApiError(400, "invalid_signature", "Invalid signature") from None
    # TODO(orders): store payment_events (unique provider+event_id), enqueue processing.
    return {"ok": True}
