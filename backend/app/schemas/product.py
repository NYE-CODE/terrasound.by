from datetime import datetime
from typing import Any

from pydantic import field_serializer

from app.schemas.common import CamelModel
from app.schemas.datetime_format import serialize_utc_datetime
from app.schemas.review import ProductReviewPublicOut


class ProductCardOut(CamelModel):
    id: str
    brand: str
    name: str
    specs: str
    price: float
    sale_price: float | None = None
    image: str
    category: str
    in_stock: bool = True
    rating_avg: float | None = None
    review_count: int = 0
    created_at: datetime | None = None

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime | None) -> str | None:
        if value is None:
            return None
        return serialize_utc_datetime(value)


class ProductDetailOut(CamelModel):
    id: str
    brand: str
    name: str
    price: float
    sale_price: float | None = None
    images: list[str]
    specs: dict[str, str]
    attributes: dict[str, Any] = {}
    attribute_specs: list["ProductAttributeSpecOut"] = []
    compatibility: list[str]
    reviews: list[ProductReviewPublicOut] = []
    in_stock: bool = True
    rating_avg: float | None = None
    review_count: int = 0


class ProductAttributeSpecOut(CamelModel):
    label: str
    value: str
    sort_order: int = 0
