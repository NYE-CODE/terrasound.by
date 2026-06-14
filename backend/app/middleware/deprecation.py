from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api_constants import API_V1_PREFIX, API_V1_SUNSET, API_V2_PREFIX


class ApiDeprecationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        path = request.url.path

        if path.startswith(f"{API_V1_PREFIX}/") or path == API_V1_PREFIX:
            response.headers["Deprecation"] = "true"
            response.headers["Sunset"] = API_V1_SUNSET
            successor = _map_v1_to_v2(path)
            response.headers["Link"] = f"<{successor}>; rel=\"successor-version\""
        elif path == "/api/health":
            response.headers["Deprecation"] = "true"
            response.headers["Sunset"] = API_V1_SUNSET
            response.headers["Link"] = f"<{API_V2_PREFIX}/health>; rel=\"successor-version\""

        return response


def _map_v1_to_v2(path: str) -> str:
    if path == f"{API_V1_PREFIX}/health":
        return f"{API_V2_PREFIX}/health"
    if path == f"{API_V1_PREFIX}/catalog/brands":
        return f"{API_V2_PREFIX}/products/facets/brands"
    if path == f"{API_V1_PREFIX}/catalog/price-bounds":
        return f"{API_V2_PREFIX}/products/facets/price-bounds"
    if path == f"{API_V1_PREFIX}/installation/services":
        return f"{API_V2_PREFIX}/installation-services"
    if path == f"{API_V1_PREFIX}/installation/requests":
        return f"{API_V2_PREFIX}/installation-requests"
    if path == f"{API_V1_PREFIX}/site-stats":
        return f"{API_V2_PREFIX}/site/settings/stats"
    if path == f"{API_V1_PREFIX}/site-contact":
        return f"{API_V2_PREFIX}/site/settings/contact"
    if path == f"{API_V1_PREFIX}/site-announcement":
        return f"{API_V2_PREFIX}/site/settings/announcement"
    if path == f"{API_V1_PREFIX}/product-highlights":
        return f"{API_V2_PREFIX}/site/settings/product-highlights"
    if path.startswith(f"{API_V1_PREFIX}/admin/site-"):
        section = path.removeprefix(f"{API_V1_PREFIX}/admin/site-")
        return f"{API_V2_PREFIX}/admin/site/settings/{section}"
    if path == f"{API_V1_PREFIX}/admin/product-highlights":
        return f"{API_V2_PREFIX}/admin/site/settings/product-highlights"
    if path.startswith(f"{API_V1_PREFIX}/admin/services"):
        return path.replace(f"{API_V1_PREFIX}/admin/services", f"{API_V2_PREFIX}/admin/installation-services", 1)
    if path.startswith(f"{API_V1_PREFIX}/admin/uploads/"):
        return path.replace(f"{API_V1_PREFIX}/admin/uploads", f"{API_V2_PREFIX}/admin/media", 1)
    return path.replace(API_V1_PREFIX, API_V2_PREFIX, 1)
