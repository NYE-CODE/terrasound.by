from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer

from app.schemas.common import CamelModel
from app.models.order import OrderStatus

PaymentMethod = Literal["cash", "card", "bank"]


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=30)
    email: EmailStr
    city: str = Field(default="", max_length=100)
    address: str = Field(min_length=1, max_length=500)


class CarIn(BaseModel):
    make: str = Field(default="", max_length=100)
    model: str = Field(default="", max_length=100)
    year: str = Field(default="", max_length=10)
    comment: str | None = Field(default=None, max_length=1000)


class OrderItemIn(BaseModel):
    product_id: str = Field(alias="productId", max_length=36)
    quantity: int = Field(ge=1, le=99)

    model_config = {"populate_by_name": True}


class OrderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    contact: ContactIn
    car: CarIn
    items: list[OrderItemIn] = Field(min_length=1, max_length=50)
    installation_consultation_requested: bool = Field(
        default=False, alias="installationConsultationRequested"
    )
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
    installation_consultation_requested: bool
    payment_method: str
    total: float
    created_at: datetime
    items: list[OrderItemOut] = []

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"


class OrderStatusUpdate(BaseModel):
    status: Literal["new", "confirmed", "completed", "cancelled"]
