from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import CamelModel, to_camel


class SiteAnnouncementOut(CamelModel):
    text: str
    enabled: bool


class SiteAnnouncementUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    text: str = Field(default="", max_length=512, strip_whitespace=True)
    enabled: bool = False
