from datetime import date, datetime, time
from typing import Any

from sqlalchemy.orm import Query


def normalize_search_query(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def parse_filter_date_from(value: str | None) -> datetime | None:
    if not value or not value.strip():
        return None
    try:
        parsed = date.fromisoformat(value.strip())
    except ValueError:
        return None
    return datetime.combine(parsed, time.min)


def parse_filter_date_to(value: str | None) -> datetime | None:
    if not value or not value.strip():
        return None
    try:
        parsed = date.fromisoformat(value.strip())
    except ValueError:
        return None
    return datetime.combine(parsed, time.max)


def apply_created_at_range(
    query: Query[Any],
    *,
    column: Any,
    date_from: datetime | None,
    date_to: datetime | None,
) -> Query[Any]:
    if date_from is not None:
        query = query.filter(column >= date_from)
    if date_to is not None:
        query = query.filter(column <= date_to)
    return query
