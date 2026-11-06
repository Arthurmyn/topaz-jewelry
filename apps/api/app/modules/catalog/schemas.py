from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    storage_key: str
    alt: str | None
    width: int
    height: int


class StoneRef(BaseModel):
    slug: str
    name: str


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    name: str
    description: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    children: list["CategoryOut"] = []


class ProductListItem(BaseModel):
    slug: str
    name: str
    category_slug: str
    metal: str
    purity: int
    price_from_minor: int
    in_stock: bool
    image: ImageOut | None
    stones: list[StoneRef]


class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    sku: str
    size: str | None
    weight_g: Decimal | None
    price_minor: int
    old_price_minor: int | None
    available_qty: int = 0


class ProductDetail(BaseModel):
    slug: str
    name: str
    description: str | None
    category_slug: str
    category_name: str
    metal: str
    gold_color: str | None
    purity: int
    weight_g: Decimal | None
    variants: list[VariantOut]
    images: list[ImageOut]
    stones: list[StoneRef]


class FacetValue(BaseModel):
    value: str
    label: str
    count: int


class Facets(BaseModel):
    metal: list[FacetValue]
    purity: list[FacetValue]
    stone: list[FacetValue]
    price_min_minor: int | None
    price_max_minor: int | None


class ProductPage(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int
    facets: Facets | None = None


class ProductFilters(BaseModel):
    category: str | None = None
    metal: list[str] = Field(default_factory=list)
    purity: list[int] = Field(default_factory=list)
    stone: list[str] = Field(default_factory=list)
    price_min: int | None = Field(default=None, ge=0, description="KZT, whole units")
    price_max: int | None = Field(default=None, ge=0, description="KZT, whole units")
    in_stock: bool = False
    q: str | None = Field(default=None, max_length=100)
    sort: Literal["newest", "price_asc", "price_desc"] = "newest"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=24, ge=1, le=100)
    include: str | None = Field(default=None, description="'facets' to include facet counts")
