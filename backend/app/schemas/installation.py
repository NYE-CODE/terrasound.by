from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from app.schemas.common import CamelModel
from app.schemas.datetime_format import serialize_utc_datetime
from app.validation import validate_car_model, validate_person_name, validate_phone_number


class InstallationRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(max_length=100)
    phone: str = Field(max_length=30)
    car_model: str = Field(max_length=100, alias="carModel")
    service: str = Field(min_length=1, max_length=200)

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return validate_person_name(value)

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return validate_phone_number(value)

    @field_validator("car_model", mode="before")
    @classmethod
    def validate_car_model_field(cls, value: str) -> str:
        return validate_car_model(value, required=True)


class InstallationRequestOut(CamelModel):
    id: str
    name: str
    phone: str
    car_model: str
    service: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)
