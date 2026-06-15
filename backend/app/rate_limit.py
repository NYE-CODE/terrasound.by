"""In-memory rate limiting per IP (один процесс uvicorn; при нескольких воркерах — Redis или workers=1)."""

import re
import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings

_BUCKETS: dict[str, list[float]] = defaultdict(list)
_LOCK = Lock()

_RULES: list[tuple[str, str | re.Pattern[str], int, int]] = [
    ("POST", re.compile(r"^/api/v[12]/admin/sessions$"), 5, 900),
    ("DELETE", re.compile(r"^/api/v[12]/admin/sessions$"), 30, 900),
    ("PATCH", re.compile(r"^/api/v[12]/admin/me/password$"), 10, 900),
    ("POST", re.compile(r"^/api/v[12]/orders$"), 10, 60),
    ("POST", re.compile(r"^/api/v[12]/installation-requests$"), 10, 60),
    ("POST", re.compile(r"^/api/v1/installation/requests$"), 10, 60),
    ("POST", re.compile(r"^/api/v[12]/products/[^/]+/reviews$"), 5, 60),
    ("GET", re.compile(r"^/sitemap\.xml$"), 30, 60),
    ("GET", re.compile(r"^/api/v[12]/admin/"), 120, 60),
    ("POST", re.compile(r"^/api/v[12]/admin/(?!sessions)"), 100, 60),
    ("PATCH", re.compile(r"^/api/v[12]/admin/"), 100, 60),
    ("DELETE", re.compile(r"^/api/v[12]/admin/"), 100, 60),
    ("GET", re.compile(r"^/api/v[12]/site/"), 180, 60),
    ("GET", re.compile(r"^/api/v1/installation/"), 180, 60),
    (
        "GET",
        re.compile(
            r"^/api/v[12]/(products|categories|brands|blog-posts|portfolio-works|"
            r"installation-services|service-reviews|vehicles|"
            r"site-stats|site-contact|site-announcement|product-highlights|catalog)"
        ),
        180,
        60,
    ),
]


def _client_ip(request: Request) -> str:
    if settings.trust_proxy_headers:
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
