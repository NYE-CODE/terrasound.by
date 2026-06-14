from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.common import CamelModel, to_camel


class SiteContactOut(CamelModel):
    phone: str
    email: str
    instagram_url: str
    tiktok_url: str
    telegram_url: str
    address: str
    working_hours: str
    phone_tel: str
    address_maps_url: str


class SiteContactUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    phone: str = Field(min_length=1, max_length=64, strip_whitespace=True)
    email: EmailStr
    instagram_url: str = Field(default="", max_length=512, strip_whitespace=True)
    tiktok_url: str = Field(default="", max_length=512, strip_whitespace=True)
    telegram_url: str = Field(default="", max_length=512, strip_whitespace=True)
    address: str = Field(min_length=1, max_length=512, strip_whitespace=True)
    address_maps_url: str = Field(default="", max_length=1024, strip_whitespace=True)
    working_hours: str = Field(default="", max_length=256, strip_whitespace=True)
