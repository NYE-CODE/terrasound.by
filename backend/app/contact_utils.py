import re
from urllib.parse import parse_qs, unquote, urlparse

# TerraSound, г. Гродно, Озерское шоссе, 14
DEFAULT_MAP_LAT = 53.648422
DEFAULT_MAP_LON = 23.876194

_YANDEX_MAPS_HOSTS = frozenset(
    {
        "yandex.ru",
        "www.yandex.ru",
        "yandex.by",
        "www.yandex.by",
        "yandex.com",
        "www.yandex.com",
    }
)


def phone_to_tel(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    return f"+{digits}" if digits else ""


def is_yandex_maps_url(url: str) -> bool:
    raw = url.strip()
    if not raw:
        return False
    try:
        parsed = urlparse(raw)
    except ValueError:
        return False
    host = (parsed.netloc or "").lower()
    if host not in _YANDEX_MAPS_HOSTS:
        return False
    return "/maps" in parsed.path or parsed.path in {"", "/"}


def normalize_yandex_maps_url(url: str) -> str:
    return url.strip()


def address_to_maps_url(address: str) -> str:
    from urllib.parse import quote

    return f"https://yandex.by/maps/?text={quote(f'{address}, Беларусь')}"


def coords_to_yandex_open_url(lat: float, lon: float) -> str:
    return f"https://yandex.by/maps/?mode=routes&rtext=~{lat},{lon}&rtt=auto"


def coords_to_yandex_embed_url(lat: float, lon: float) -> str:
    return (
        f"https://yandex.ru/map-widget/v1/?ll={lon},{lat}"
        f"&z=17&pt={lon},{lat}&lang=ru_RU"
    )


def address_to_yandex_embed_url(address: str) -> str:
    from urllib.parse import quote

    text = f"{address.strip()}, Беларусь" if address.strip() else ""
    if not text:
        return ""
    return f"https://yandex.ru/map-widget/v1/?text={quote(text)}&lang=ru_RU"


def _parse_coord_pair(raw: str, *, lon_first: bool) -> tuple[float, float] | None:
    parts = [part.strip() for part in raw.split(",")]
    if len(parts) < 2:
        return None
    try:
        first = float(parts[0])
        second = float(parts[1])
    except ValueError:
        return None
    if lon_first:
        lon, lat = first, second
    else:
        lat, lon = first, second
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
        return None
    return lat, lon


def _coords_from_rtext(rtext: str) -> tuple[float, float] | None:
    decoded = unquote(rtext).strip()
    if not decoded:
        return None
    segments = [segment for segment in decoded.split("~") if segment.strip()]
    if not segments:
        return None
    # rtext: latitude,longitude~latitude,longitude — берём последнюю точку маршрута.
    return _parse_coord_pair(segments[-1], lon_first=False)


def extract_coords_from_yandex_url(url: str) -> tuple[float, float] | None:
    raw = url.strip()
    if not raw:
        return None
    try:
        parsed = urlparse(raw)
        query = parse_qs(parsed.query)
    except ValueError:
        return None

    rtext_values = query.get("rtext")
    if rtext_values:
        coords = _coords_from_rtext(rtext_values[0])
        if coords:
            return coords

    for key, lon_first in (("pt", True), ("ll", True)):
        values = query.get(key)
        if not values:
            continue
        coords = _parse_coord_pair(values[0], lon_first=lon_first)
        if coords:
            return coords

    return None


def resolve_maps_open_url(
    *,
    address: str,
    maps_url: str,
    map_lat: float | None,
    map_lon: float | None,
) -> str:
    stored = normalize_yandex_maps_url(maps_url)
    if stored and is_yandex_maps_url(stored):
        return stored
    if map_lat is not None and map_lon is not None:
        return coords_to_yandex_open_url(map_lat, map_lon)
    return address_to_maps_url(address)


def resolve_map_embed_url(
    *,
    address: str,
    maps_url: str,
    map_lat: float | None,
    map_lon: float | None,
) -> str:
    stored = normalize_yandex_maps_url(maps_url)
    if stored and is_yandex_maps_url(stored):
        coords = extract_coords_from_yandex_url(stored)
        if coords:
            lat, lon = coords
            return coords_to_yandex_embed_url(lat, lon)

    if map_lat is not None and map_lon is not None:
        return coords_to_yandex_embed_url(map_lat, map_lon)
    return address_to_yandex_embed_url(address)


def resolve_map_coordinates(
    *,
    maps_url: str,
    map_lat: float | None,
    map_lon: float | None,
) -> tuple[float | None, float | None]:
    stored = normalize_yandex_maps_url(maps_url)
    if stored and is_yandex_maps_url(stored):
        coords = extract_coords_from_yandex_url(stored)
        if coords:
            return coords
    return map_lat, map_lon
