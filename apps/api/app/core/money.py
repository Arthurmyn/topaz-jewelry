"""Money helpers. All amounts are integers in minor units (1 KZT = 100 tiyn)."""

from pydantic import BaseModel

CURRENCY = "KZT"
MINOR_PER_UNIT = 100


def kzt_to_minor(amount_kzt: int) -> int:
    return amount_kzt * MINOR_PER_UNIT


class Money(BaseModel):
    amount_minor: int
    currency: str = CURRENCY
