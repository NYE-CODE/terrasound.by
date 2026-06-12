from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db_errors import integrity_error_detail, integrity_error_status


def commit_or_raise(db: Session) -> None:
    """Единая точка commit: IntegrityError → HTTP с русским текстом вместо сырого SQL."""
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=integrity_error_status(exc),
            detail=integrity_error_detail(exc),
        ) from exc
