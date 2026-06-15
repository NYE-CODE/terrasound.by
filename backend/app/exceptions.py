"""Обработчики ошибок в формате Problem Details (type, title, status, detail, errors[])."""

import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.db_errors import integrity_error_detail, integrity_error_status

logger = logging.getLogger(__name__)

_GENERIC_FIELD_ERROR = "Некорректное значение"


def _validation_errors(exc: RequestValidationError) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []
    for err in exc.errors():
        loc = err.get("loc", ())
        field = ".".join(str(part) for part in loc if part != "body")
        if settings.is_production:
            message = _GENERIC_FIELD_ERROR
        else:
            message = str(err.get("msg", _GENERIC_FIELD_ERROR))
        errors.append({"field": field or "body", "message": message})
    return errors


async def validation_exception_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.debug("Validation error: %s", exc.errors())
    return JSONResponse(
        status_code=422,
        content={
            "type": "validation_error",
            "title": "Некорректные данные запроса",
            "status": 422,
            "detail": "Некорректные данные запроса",
            "errors": _validation_errors(exc),
        },
    )


async def integrity_exception_handler(_: Request, exc: IntegrityError) -> JSONResponse:
    logger.warning("Integrity error: %s", exc)
    status = integrity_error_status(exc)
    detail = integrity_error_detail(exc)
    return JSONResponse(
        status_code=status,
        content={
            "type": "integrity_error",
            "title": "Ошибка данных",
            "status": status,
            "detail": detail,
        },
    )


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Ошибка запроса"
        if settings.is_production and exc.status_code >= 500:
            detail = "Внутренняя ошибка сервера"
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "type": "http_error",
                "title": "Ошибка запроса",
                "status": exc.status_code,
                "detail": detail,
            },
        )

    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "type": "internal_error",
            "title": "Внутренняя ошибка сервера",
            "status": 500,
            "detail": "Внутренняя ошибка сервера",
        },
    )
