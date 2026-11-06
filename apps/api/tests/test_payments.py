import json

import pytest
from httpx import AsyncClient

from app.core.config import get_settings
from app.modules.payments.interface import (
    CreatePaymentRequest,
    InvalidSignatureError,
    PaymentStatus,
)
from app.modules.payments.providers.mock import SIGNATURE_HEADER, sign
from app.modules.payments.registry import get_provider
from app.modules.payments.state import can_transition


def test_create_payment_returns_redirect() -> None:
    res = get_provider("mock").create_payment(
        CreatePaymentRequest("TZ-1", 1000, "KZT", "key", "http://x/return")
    )
    assert res.provider_payment_id.startswith("mock_")
    assert "/mock-pay/" in res.redirect_url


def test_webhook_signature() -> None:
    provider = get_provider("mock")
    body = json.dumps(
        {"event_id": "e1", "payment_id": "p1", "status": "succeeded", "amount_minor": 5000}
    ).encode()
    good = sign(body, get_settings().payment_webhook_secret)
    event = provider.parse_webhook({SIGNATURE_HEADER: good}, body)
    assert event.status is PaymentStatus.SUCCEEDED
    with pytest.raises(InvalidSignatureError):
        provider.parse_webhook({SIGNATURE_HEADER: "bad"}, body)


def test_state_machine() -> None:
    assert can_transition(PaymentStatus.PENDING, PaymentStatus.SUCCEEDED)
    assert not can_transition(PaymentStatus.SUCCEEDED, PaymentStatus.PENDING)
    assert not can_transition(PaymentStatus.FAILED, PaymentStatus.SUCCEEDED)


async def test_webhook_endpoint_rejects_bad_signature(client: AsyncClient) -> None:
    r = await client.post(
        "/api/v1/webhooks/payments/mock", content=b"{}", headers={SIGNATURE_HEADER: "bad"}
    )
    assert r.status_code == 400
    assert r.json()["code"] == "invalid_signature"
    assert (await client.post("/api/v1/webhooks/payments/nope", content=b"{}")).status_code == 404
