import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


async def validation_exception_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.debug("Validation error: %s", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": "Некорректные данные запроса"},
    )


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Ошибка запроса"
        return JSONResponse(status_code=exc.status_code, content={"detail": detail})

    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Внутренняя ошибка сервера"},
    )
