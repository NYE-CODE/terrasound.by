from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

from app.services.password_policy import STRONG_PASSWORD_MAX_LENGTH, STRONG_PASSWORD_MIN_LENGTH, validate_strong_password


class LoginRequest(BaseModel):
    username: str = Field(max_length=128)
    password: str = Field(max_length=128)


class TokenResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    access_token: str
    token_type: str = "bearer"


class AdminUser(BaseModel):
    username: str


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=STRONG_PASSWORD_MIN_LENGTH, max_length=STRONG_PASSWORD_MAX_LENGTH)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_strong_password(value)
