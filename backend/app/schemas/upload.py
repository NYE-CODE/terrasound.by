from pydantic import Field

from app.schemas.common import CamelModel


class UploadUrlOut(CamelModel):
    url: str = Field(min_length=1)


class UploadUrlResponse(CamelModel):
    data: UploadUrlOut
