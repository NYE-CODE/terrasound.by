import re
from urllib.parse import quote


def phone_to_tel(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    return f"+{digits}" if digits else ""


def address_to_maps_url(address: str) -> str:
    return f"https://yandex.by/maps/?text={quote(f'{address}, Беларусь')}"
