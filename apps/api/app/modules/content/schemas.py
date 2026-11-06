from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class StoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    city: str
    name: str
    address: str
    lat: Decimal | None
    lng: Decimal | None
    phone: str | None
    opening_hours: dict[str, str] | None
    description: str | None
