from collections.abc import Callable
from time import monotonic
from typing import TypeVar

T = TypeVar("T")

CONTENT_CATEGORIES = "content:categories"
CONTENT_BRANDS = "content:brands"
CONTENT_SERVICES = "content:services"
PRODUCT_BRANDS = "products:brands"
CATALOG_PRICE_BOUNDS = "catalog:price-bounds"
SITE_STATS = "site-stats"
SITE_CONTACT = "site-contact"


def category_filters_cache_key(category_id: str) -> str:
    return f"category-filters:{category_id}"

DEFAULT_TTL_SECONDS = 300.0


class TTLCache:
    def __init__(self, ttl_seconds: float = DEFAULT_TTL_SECONDS) -> None:
        self.ttl_seconds = ttl_seconds
        self._entries: dict[str, tuple[float, object]] = {}

    def get(self, key: str, loader: Callable[[], T]) -> T:
        now = monotonic()
        entry = self._entries.get(key)
        if entry is not None and now - entry[0] < self.ttl_seconds:
            return entry[1]  # type: ignore[return-value]

        value = loader()
        self._entries[key] = (now, value)
        return value

    def invalidate(self, key: str | None = None) -> None:
        if key is None:
            self._entries.clear()
        else:
            self._entries.pop(key, None)


content_cache = TTLCache()
site_stats_cache = TTLCache()
site_contact_cache = TTLCache()


def invalidate_content_cache() -> None:
    for key in (CONTENT_CATEGORIES, CONTENT_BRANDS, CONTENT_SERVICES, PRODUCT_BRANDS, CATALOG_PRICE_BOUNDS):
        content_cache.invalidate(key)


def invalidate_category_filters_cache(category_id: str) -> None:
    content_cache.invalidate(category_filters_cache_key(category_id))
