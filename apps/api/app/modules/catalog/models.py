from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), index=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(400))


class Stone(Base):
    __tablename__ = "stones"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(120))


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_active_category_published", "is_active", "category_id", "published_at"),
        Index("ix_products_metal_purity", "metal", "purity"),
        Index(
            "ix_products_name_trgm",
            text("name gin_trgm_ops"),
            postgresql_using="gin",
        ),
        CheckConstraint("metal IN ('gold','silver','platinum')", name="metal"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(250))
    description: Mapped[str | None] = mapped_column(Text)
    metal: Mapped[str] = mapped_column(String(20))
    gold_color: Mapped[str | None] = mapped_column(String(20))  # yellow | white | rose
    purity: Mapped[int] = mapped_column(Integer)  # 585, 750, 925 ...
    weight_g: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    category: Mapped[Category] = relationship()
    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product", order_by="ProductVariant.price_minor"
    )
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        order_by="(ProductImage.is_primary.desc(), ProductImage.sort_order)",
    )
    product_stones: Mapped[list["ProductStone"]] = relationship()


class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (
        CheckConstraint("reserved_qty >= 0 AND reserved_qty <= stock_qty", name="reserved_range"),
        CheckConstraint("price_minor >= 0", name="price_non_negative"),
        Index(
            "ix_product_variants_available",
            "product_id",
            postgresql_where=text("stock_qty - reserved_qty > 0"),
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    sku: Mapped[str] = mapped_column(String(64), unique=True)
    size: Mapped[str | None] = mapped_column(String(20))
    weight_g: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    price_minor: Mapped[int] = mapped_column(BigInteger)
    old_price_minor: Mapped[int | None] = mapped_column(BigInteger)
    stock_qty: Mapped[int] = mapped_column(Integer, default=0)
    reserved_qty: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    product: Mapped[Product] = relationship(back_populates="variants")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    storage_key: Mapped[str] = mapped_column(String(300))  # base key; variants are {key}/{w}.{ext}
    alt: Mapped[str | None] = mapped_column(String(250))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    product: Mapped[Product] = relationship(back_populates="images")


class ProductStone(Base):
    __tablename__ = "product_stones"

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    stone_id: Mapped[int] = mapped_column(ForeignKey("stones.id"), primary_key=True, index=True)
    count: Mapped[int | None] = mapped_column(Integer)
    carat: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))

    stone: Mapped[Stone] = relationship()
