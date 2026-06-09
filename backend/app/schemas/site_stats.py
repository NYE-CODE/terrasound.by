from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import CamelModel, to_camel


class SiteStatsOut(CamelModel):
    installations_completed: int
    years_expertise: int


class SiteStatsUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    installations_completed: int = Field(ge=0, le=1_000_000)
    years_expertise: int = Field(ge=0, le=200)
