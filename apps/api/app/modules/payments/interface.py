"""Provider-agnostic payment interface. Business logic depends only on this module."""

from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol


class PaymentStatus(StrEnum):
    CREATED = "created"
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class InvalidSignatureError(Exception):
    """Webhook signature verification failed."""


@dataclass(frozen=True)
class CreatePaymentRequest:
    order_number: str
    amount_minor: int
    currency: str
    idempotency_key: str
    return_url: str
    customer_email: str | None = None


@dataclass(frozen=True)
class CreatePaymentResult:
    provider_payment_id: str
    redirect_url: str
    status: PaymentStatus = PaymentStatus.PENDING


@dataclass(frozen=True)
class WebhookEvent:
    provider_event_id: str
    provider_payment_id: str
    status: PaymentStatus
    amount_minor: int
    currency: str


@dataclass(frozen=True)
class RefundResult:
    provider_refund_id: str
    status: PaymentStatus


class PaymentProvider(Protocol):
    name: str

    def create_payment(self, req: CreatePaymentRequest) -> CreatePaymentResult: ...

    def parse_webhook(self, headers: Mapping[str, str], raw_body: bytes) -> WebhookEvent:
        """Verify the signature, normalize the payload; raise InvalidSignatureError on failure."""
        ...

    def get_status(self, provider_payment_id: str) -> PaymentStatus:
        """Server-to-server status lookup, used for reconciliation."""
        ...

    def refund(self, provider_payment_id: str, amount_minor: int) -> RefundResult: ...
