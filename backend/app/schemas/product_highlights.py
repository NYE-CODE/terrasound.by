from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import CamelModel, to_camel

MAX_HIGHLIGHTS = 10
MAX_HIGHLIGHT_LENGTH = 256


class ProductHighlightsOut(CamelModel):
    highlights: list[str]


class ProductHighlightsUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    highlights: list[str] = Field(default_factory=list, max_length=MAX_HIGHLIGHTS)

    @field_validator("highlights")
    @classmethod
    def normalize_highlights(cls, value: list[str]) -> list[str]:
        normalized: list[str] = []
        for item in value:
            text = item.strip()
            if not text:
                continue
            if len(text) > MAX_HIGHLIGHT_LENGTH:
                raise ValueError(f"Каждый пункт не длиннее {MAX_HIGHLIGHT_LENGTH} символов")
            normalized.append(text)
        if len(normalized) > MAX_HIGHLIGHTS:
            raise ValueError(f"Не более {MAX_HIGHLIGHTS} пунктов")
        return normalized
