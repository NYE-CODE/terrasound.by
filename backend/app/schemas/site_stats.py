from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import CamelModel, to_camel


class SiteStatsOut(CamelModel):
    installations_completed: str
    years_expertise: str


class SiteStatsUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    installations_completed: str = Field(min_length=1, max_length=64, strip_whitespace=True)
    years_expertise: str = Field(min_length=1, max_length=64, strip_whitespace=True)
