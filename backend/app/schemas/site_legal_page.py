from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.schemas.common import CamelModel, to_camel
from app.schemas.datetime_format import serialize_utc_datetime


class SiteLegalPageOut(CamelModel):
    slug: str
    title: str
    content: str
    updated_at: datetime

    @field_serializer("updated_at")
    def serialize_updated_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class SiteLegalPageUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    title: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    content: str = Field(min_length=1, max_length=50_000)
