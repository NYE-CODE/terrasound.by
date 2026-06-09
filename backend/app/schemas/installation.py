from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.schemas.common import CamelModel


class InstallationRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=30)
    car_model: str = Field(min_length=1, max_length=100, alias="carModel")
    service: str = Field(min_length=1, max_length=200)


class InstallationRequestOut(CamelModel):
    id: str
    name: str
    phone: str
    car_model: str
    service: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat() + "Z"
