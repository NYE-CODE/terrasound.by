"""Единый контракт списков API: { data, meta: { total, limit, offset } }."""

from typing import Generic, TypeVar

from pydantic import Field

from app.schemas.common import CamelModel

T = TypeVar("T")


class PaginationMeta(CamelModel):
    total: int = Field(ge=0)
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)


class PaginatedOut(CamelModel, Generic[T]):
    data: list[T]
    meta: PaginationMeta


def paginated(
    data: list[T],
    *,
    total: int,
    limit: int,
    offset: int,
) -> PaginatedOut[T]:
    """Собирает ответ списка с метаданными пагинации."""
    return PaginatedOut(
        data=data,
        meta=PaginationMeta(total=total, limit=limit, offset=offset),
    )
