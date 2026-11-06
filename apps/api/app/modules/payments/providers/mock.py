"""Mock provider for local development and tests.

Follows the real redirect + signed webhook flow so the whole pipeline is exercised.
The mock payment page lives in the web app (/mock-pay/[id]) and posts a signed webhook.
"""

import hashlib
import hmac
import json
import uuid
from collections.abc import Mapping

from app.core.config import get_settings
from app.modules.payments.interface import (
    CreatePaymentRequest,
    CreatePaymentResult,
    InvalidSignatureError,
    PaymentStatus,
    RefundResult,
    WebhookEvent,
)

SIGNATURE_HEADER = "x-mock-signature"


def sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


class MockProvider:
    name = "mock"

    def create_payment(self, req: CreatePaymentRequest) -> CreatePaymentResult:
        payment_id = f"mock_{uuid.uuid4().hex}"
        site = get_settings().site_url.rstrip("/")
        return CreatePaymentResult(
            provider_payment_id=payment_id,
            redirect_url=f"{site}/mock-pay/{payment_id}?order={req.order_number}",
        )

    def parse_webhook(self, headers: Mapping[str, str], raw_body: bytes) -> WebhookEvent:
        given = {k.lower(): v for k, v in headers.items()}.get(SIGNATURE_HEADER, "")
        expected = sign(raw_body, get_settings().payment_webhook_secret)
        if not hmac.compare_digest(given, expected):
            raise InvalidSignatureError
        data = json.loads(raw_body)
        return WebhookEvent(
            provider_event_id=data["event_id"],
            provider_payment_id=data["payment_id"],
            status=PaymentStatus(data["status"]),
            amount_minor=int(data["amount_minor"]),
            currency=data.get("currency", "KZT"),
        )

    def get_status(self, provider_payment_id: str) -> PaymentStatus:
        return PaymentStatus.PENDING  # the mock keeps no state; status arrives via webhook

    def refund(self, provider_payment_id: str, amount_minor: int) -> RefundResult:
        return RefundResult(
            provider_refund_id=f"refund_{uuid.uuid4().hex}", status=PaymentStatus.REFUNDED
        )
