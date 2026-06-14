import re
from urllib.parse import quote

# TerraSound, г. Гродно, Озерское шоссе, 14
DEFAULT_MAP_LAT = 53.648422
DEFAULT_MAP_LON = 23.876194


def phone_to_tel(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    return f"+{digits}" if digits else ""


def address_to_maps_url(address: str) -> str:
    return f"https://yandex.by/maps/?text={quote(f'{address}, Беларусь')}"


def coords_to_yandex_open_url(lat: float, lon: float) -> str:
    return f"https://yandex.by/maps/?pt={lon},{lat}&z=17&l=map"


def coords_to_yandex_embed_url(lat: float, lon: float) -> str:
    return (
        f"https://yandex.ru/map-widget/v1/?ll={lon},{lat}"
        f"&z=17&pt={lon},{lat}&lang=ru_RU"
    )


def address_to_yandex_embed_url(address: str) -> str:
    text = f"{address.strip()}, Беларусь" if address.strip() else ""
    if not text:
        return ""
    return f"https://yandex.ru/map-widget/v1/?text={quote(text)}&lang=ru_RU"


def resolve_maps_open_url(
    *,
    address: str,
    maps_url: str,
    map_lat: float | None,
    map_lon: float | None,
) -> str:
    if map_lat is not None and map_lon is not None:
        return coords_to_yandex_open_url(map_lat, map_lon)
    stored = maps_url.strip()
    if stored:
        return stored
    return address_to_maps_url(address)


def resolve_map_embed_url(
    *,
    address: str,
    map_lat: float | None,
    map_lon: float | None,
) -> str:
    if map_lat is not None and map_lon is not None:
        return coords_to_yandex_embed_url(map_lat, map_lon)
    return address_to_yandex_embed_url(address)
