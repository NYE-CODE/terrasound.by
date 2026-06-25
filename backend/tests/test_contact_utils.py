from app.contact_utils import (
    coords_to_yandex_embed_url,
    coords_to_yandex_open_url,
    extract_coords_from_yandex_url,
    is_yandex_maps_url,
    resolve_map_embed_url,
    resolve_maps_open_url,
)

USER_ROUTE_URL = (
    "https://yandex.by/maps/10274/grodno/?ll=23.865779%2C53.690688"
    "&mode=routes&rtext=~53.690643%2C23.865677&rtt=auto"
    "&ruri=~ymapsbm1%3A%2F%2Forg%3Foid%3D3206159568&z=19.96"
)


def test_is_yandex_maps_url() -> None:
    assert is_yandex_maps_url("https://yandex.by/maps/?pt=23.8,53.6")
    assert is_yandex_maps_url(USER_ROUTE_URL)
    assert not is_yandex_maps_url("https://google.com/maps")
    assert not is_yandex_maps_url("")


def test_extract_coords_from_route_url() -> None:
    coords = extract_coords_from_yandex_url(USER_ROUTE_URL)
    assert coords is not None
    lat, lon = coords
    assert abs(lat - 53.690643) < 0.0001
    assert abs(lon - 23.865677) < 0.0001


def test_resolve_maps_open_url_prefers_stored_link() -> None:
    url = resolve_maps_open_url(
        address="г. Гродно",
        maps_url=USER_ROUTE_URL,
        map_lat=53.0,
        map_lon=23.0,
    )
    assert url == USER_ROUTE_URL


def test_resolve_map_embed_url_builds_widget_from_stored_link() -> None:
    embed = resolve_map_embed_url(
        address="г. Гродно",
        maps_url=USER_ROUTE_URL,
        map_lat=None,
        map_lon=None,
    )
    assert embed.startswith("https://yandex.ru/map-widget/v1/")
    assert "53.690643" in embed
    assert "23.865677" in embed


def test_coords_to_yandex_open_url_uses_route_mode() -> None:
    url = coords_to_yandex_open_url(53.648422, 23.876194)
    assert "mode=routes" in url
    assert "rtext=~53.648422,23.876194" in url


def test_coords_to_yandex_embed_url() -> None:
    url = coords_to_yandex_embed_url(53.648422, 23.876194)
    assert "map-widget/v1" in url
    assert "ll=23.876194,53.648422" in url
