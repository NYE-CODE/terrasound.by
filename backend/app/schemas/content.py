from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator
from pydantic.alias_generators import to_camel

from app.schemas.common import CamelModel


def normalize_sale_price(value: Any) -> float | None:
    if value is None or value == "":
        return None
    numeric = float(value)
    if numeric <= 0:
        return None
    return numeric


class InstallationServiceOut(CamelModel):
    id: str
    title: str
    description: str
    sort_order: int
    published: bool


class InstallationServiceCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    sort_order: int = 0
    published: bool = True


class InstallationServiceUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str | None = None
    description: str | None = None
    sort_order: int | None = None
    published: bool | None = None


class BrandOut(CamelModel):
    id: str
    name: str
    description: str
    country: str
    since: str
    sort_order: int
    published: bool


class BrandCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    country: str = Field(min_length=1)
    since: str = Field(min_length=1)
    sort_order: int = 0
    published: bool = True


class BrandUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    name: str | None = None
    description: str | None = None
    country: str | None = None
    since: str | None = None
    sort_order: int | None = None
    published: bool | None = None


class BlogPostOut(CamelModel):
    id: str
    title: str
    excerpt: str
    content: str
    category: str
    published: bool
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"


def _format_blog_date(value: datetime) -> str:
    months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ]
    return f"{value.day} {months[value.month - 1]} {value.year}"


class BlogPostCardOut(CamelModel):
    id: str
    title: str
    excerpt: str
    category: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return _format_blog_date(value)


class BlogPostDetailOut(CamelModel):
    id: str
    title: str
    excerpt: str
    content: str
    category: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return _format_blog_date(value)


class BlogPostCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1)
    excerpt: str = Field(min_length=1)
    content: str = ""
    category: str = Field(min_length=1)
    published: bool = True


class BlogPostUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str | None = None
    excerpt: str | None = None
    content: str | None = None
    category: str | None = None
    published: bool | None = None


class PortfolioWorkOut(CamelModel):
    id: str
    title: str
    image_url: str
    sort_order: int


class PortfolioWorkAdminOut(CamelModel):
    id: str
    title: str
    image_url: str
    sort_order: int
    published: bool


class PortfolioWorkCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1)
    image_url: str = Field(min_length=1)
    sort_order: int = 0
    published: bool = True


class PortfolioWorkUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    published: bool | None = None


class CategoryOut(CamelModel):
    id: str
    name: str
    image_url: str
    sort_order: int
    grid_cols: int
    grid_tall: bool


class CategoryAdminOut(CamelModel):
    id: str
    name: str
    image_url: str
    sort_order: int
    grid_cols: int
    grid_tall: bool
    published: bool
    product_count: int


class CategoryCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    id: str = Field(min_length=1, max_length=50, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: str = Field(min_length=1)
    image_url: str = Field(min_length=1)
    sort_order: int = 0
    grid_cols: int = Field(default=1, ge=1, le=2)
    grid_tall: bool = False
    published: bool = True


class CategoryUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    name: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    grid_cols: int | None = Field(default=None, ge=1, le=2)
    grid_tall: bool | None = None
    published: bool | None = None


class ProductAdminOut(CamelModel):
    id: str
    brand: str
    name: str
    price: float
    sale_price: float | None = None
    category: str
    image_url: str
    specs_short: str
    in_stock: bool
    images: list[str] = []
    specs: dict[str, str] = {}
    attributes: dict[str, Any] = {}
    compatibility: list[str] = []


class ProductCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    brand: str = Field(min_length=1)
    name: str = Field(min_length=1)
    price: float = Field(gt=0)
    sale_price: float | None = Field(default=None, gt=0)
    category: str = Field(min_length=1)
    image_url: str = Field(min_length=1)
    specs_short: str = ""
    in_stock: bool = True
    images: list[str] = []
    specs: dict[str, str] = {}
    attributes: dict[str, Any] = {}
    compatibility: list[str] = []

    @field_validator("sale_price", mode="before")
    @classmethod
    def normalize_create_sale_price(cls, value: Any) -> float | None:
        return normalize_sale_price(value)


class ProductUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    brand: str | None = None
    name: str | None = None
    price: float | None = Field(default=None, gt=0)
    sale_price: float | None = Field(default=None, gt=0)
    category: str | None = None
    image_url: str | None = None
    specs_short: str | None = None
    in_stock: bool | None = None
    images: list[str] | None = None
    specs: dict[str, str] | None = None
    attributes: dict[str, Any] | None = None
    compatibility: list[str] | None = None

    @field_validator("sale_price", mode="before")
    @classmethod
    def normalize_update_sale_price(cls, value: Any) -> float | None:
        return normalize_sale_price(value)
