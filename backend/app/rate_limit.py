import re
import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

_BUCKETS: dict[str, list[float]] = defaultdict(list)
_LOCK = Lock()

_RULES: list[tuple[str, str | re.Pattern[str], int, int]] = [
    ("POST", "/api/admin/auth/login", 5, 900),
    ("POST", "/api/admin/auth/change-password", 10, 900),
    ("POST", "/api/orders", 10, 60),
    ("POST", "/api/installation-requests", 10, 60),
    ("POST", re.compile(r"^/api/products/[^/]+/reviews$"), 5, 60),
]


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
        if ip:
            return ip
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _match_rule(method: str, path: str) -> tuple[int, int] | None:
    for rule_method, pattern, limit, window in _RULES:
        if rule_method != method:
            continue
        if isinstance(pattern, str):
            if path == pattern:
                return limit, window
        elif pattern.match(path):
            return limit, window
    return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rule = _match_rule(request.method, request.url.path)
        if rule is None:
            return await call_next(request)

        limit, window = rule
        key = f"{request.method}:{request.url.path}:{_client_ip(request)}"
        now = time.monotonic()

        with _LOCK:
            timestamps = [t for t in _BUCKETS[key] if t > now - window]
            if len(timestamps) >= limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Слишком много запросов. Попробуйте позже."},
                )
            timestamps.append(now)
            _BUCKETS[key] = timestamps

        return await call_next(request)
