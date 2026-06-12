from datetime import datetime, timezone


def serialize_utc_datetime(value: datetime) -> str:
    """ISO 8601 UTC; naive datetime трактуется как уже UTC (SQLite без tz)."""
    if value.tzinfo is None:
        return value.isoformat() + "Z"
    return value.astimezone(timezone.utc).replace(tzinfo=None).isoformat() + "Z"
