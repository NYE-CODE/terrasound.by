from pydantic import BaseModel, ConfigDict, Field

from app.models.site_announcement import DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS
from app.schemas.common import CamelModel, to_camel

MIN_ANNOUNCEMENT_SCROLL_DURATION_SECONDS = 5
MAX_ANNOUNCEMENT_SCROLL_DURATION_SECONDS = 180


class SiteAnnouncementOut(CamelModel):
    text: str
    enabled: bool
    scroll_duration_seconds: int


class SiteAnnouncementUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    text: str = Field(default="", max_length=512, strip_whitespace=True)
    enabled: bool = False
    scroll_duration_seconds: int = Field(
        default=DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS,
        ge=MIN_ANNOUNCEMENT_SCROLL_DURATION_SECONDS,
        le=MAX_ANNOUNCEMENT_SCROLL_DURATION_SECONDS,
    )
