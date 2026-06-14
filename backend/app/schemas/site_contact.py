from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.schemas.common import CamelModel, to_camel

MIN_MAP_LAT = -90.0
MAX_MAP_LAT = 90.0
MIN_MAP_LON = -180.0
MAX_MAP_LON = 180.0


class SiteContactOut(CamelModel):
    phone: str
    email: str
    instagram_url: str
    tiktok_url: str
    telegram_url: str
    address: str
    working_hours: str
    phone_tel: str
    map_lat: float | None
    map_lon: float | None
    address_maps_url: str
    map_embed_url: str


class SiteContactUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    phone: str = Field(min_length=1, max_length=64, strip_whitespace=True)
    email: EmailStr
    instagram_url: str = Field(default="", max_length=512, strip_whitespace=True)
    tiktok_url: str = Field(default="", max_length=512, strip_whitespace=True)
    telegram_url: str = Field(default="", max_length=512, strip_whitespace=True)
    address: str = Field(min_length=1, max_length=512, strip_whitespace=True)
    map_lat: float | None = Field(default=None, ge=MIN_MAP_LAT, le=MAX_MAP_LAT)
    map_lon: float | None = Field(default=None, ge=MIN_MAP_LON, le=MAX_MAP_LON)
    working_hours: str = Field(default="", max_length=256, strip_whitespace=True)

    @model_validator(mode="after")
    def validate_map_coordinates(self) -> "SiteContactUpdate":
        if (self.map_lat is None) != (self.map_lon is None):
            raise ValueError("Укажите широту и долготу вместе или оставьте оба поля пустыми")
        return self
