from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.schemas.common import CamelModel
from app.schemas.datetime_format import serialize_utc_datetime
from app.models.order import OrderStatus
from app.validation import validate_car_model, validate_person_name, validate_phone_number

PaymentMethod = Literal["cash", "card", "bank"]


class ContactIn(BaseModel):
    name: str = Field(max_length=100)
    phone: str = Field(max_length=30)
    email: EmailStr
    city: str = Field(default="", max_length=100)
    address: str = Field(min_length=1, max_length=500)

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return validate_person_name(value)

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return validate_phone_number(value)


class CarIn(BaseModel):
    make: str = Field(default="", max_length=100)
    model: str = Field(default="", max_length=100)
    year: str = Field(default="", max_length=10)
    comment: str | None = Field(default=None, max_length=1000)

    @field_validator("make", mode="before")
    @classmethod
    def validate_make(cls, value: str) -> str:
        return validate_car_model(value or "", required=False)

    @field_validator("model", mode="before")
    @classmethod
    def validate_model(cls, value: str) -> str:
        return validate_car_model(value or "", required=False)


class OrderItemIn(BaseModel):
    product_id: str = Field(alias="productId", max_length=36)
    quantity: int = Field(ge=1, le=99)

    model_config = {"populate_by_name": True}


class OrderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    contact: ContactIn
    car: CarIn
    items: list[OrderItemIn] = Field(min_length=1, max_length=50)
    payment_method: PaymentMethod = Field(alias="paymentMethod")


class OrderItemOut(CamelModel):
    product_id: str
    product_brand: str
    product_name: str
    unit_price: float
    quantity: int


class OrderOut(CamelModel):
    id: str
    status: OrderStatus
    name: str
    phone: str
    email: str
    city: str
    address: str
    car_make: str
    car_model: str
    car_year: str
    car_comment: str | None = None
    payment_method: str
    total: float
    created_at: datetime
    items: list[OrderItemOut] = []

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class OrderCreatedOut(CamelModel):
    id: str
    status: OrderStatus
    total: float
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class OrderStatusUpdate(BaseModel):
    status: Literal["new", "confirmed", "completed", "cancelled"]
