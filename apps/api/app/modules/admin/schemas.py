from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    parent_id: int | None
    slug: str
    name: str
    description: str | None
    sort_order: int
    is_active: bool
    seo_title: str | None
    seo_description: str | None


class CategoryCreate(BaseModel):
    parent_id: int | None = None
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True
    seo_title: str | None = None
    seo_description: str | None = None


class CategoryUpdate(BaseModel):
    parent_id: int | None = None
    slug: str | None = Field(default=None, min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None


class StoneAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    name: str


class StoneCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=1, max_length=120)


class StoneUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str | None = Field(default=None, min_length=1, max_length=120)


class StoreAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    city: str
    name: str
    address: str
    phone: str | None
    lat: Decimal | None
    lng: Decimal | None
    description: str | None
    is_active: bool


class StoreCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    city: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=300)
    phone: str | None = None
    lat: Decimal | None = None
    lng: Decimal | None = None
    description: str | None = None
    is_active: bool = True


class StoreUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    city: str | None = None
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    lat: Decimal | None = None
    lng: Decimal | None = None
    description: str | None = None
    is_active: bool | None = None
