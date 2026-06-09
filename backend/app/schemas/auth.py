from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


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
    new_password: str = Field(min_length=8, max_length=128)
