from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_serializer

from app.schemas.common import CamelModel


class ProductReviewPublicOut(CamelModel):
    id: str
    product_id: str
    author: str
    text: str
    rating: int
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"


class ProductReviewCreatedOut(ProductReviewPublicOut):
    published: bool = False


class ProductReviewOut(CamelModel):
    id: str
    product_id: str
    author: str
    email: str | None = None
    text: str
    rating: int
    created_at: datetime
    published: bool

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"


class ProductReviewCreate(BaseModel):
    author: str = Field(min_length=1, max_length=100)
    email: EmailStr
    text: str = Field(min_length=10, max_length=2000)
    rating: int = Field(default=5, ge=1, le=5)


class ServiceReviewOut(CamelModel):
    id: str
    author: str
    car: str | None = None
    rating: int
    text: str
    created_at: datetime
    published: bool

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"


class ServiceReviewCreate(BaseModel):
    author: str = Field(min_length=1, max_length=100)
    car: str | None = Field(default=None, max_length=100)
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=10, max_length=2000)
    published: bool = True


class ServiceReviewUpdate(BaseModel):
    author: str | None = Field(default=None, max_length=100)
    car: str | None = Field(default=None, max_length=100)
    rating: int | None = Field(default=None, ge=1, le=5)
    text: str | None = Field(default=None, min_length=10, max_length=2000)
    published: bool | None = None


class ProductReviewAdminUpdate(BaseModel):
    published: bool
