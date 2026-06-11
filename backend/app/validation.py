import re

PHONE_PATTERN = re.compile(r"^(\+\d{10,12}|\d{11,13})$")
PERSON_NAME_PATTERN = re.compile(
    r"^[A-Za-zА-Яа-яЁё]+(?:[ \-][A-Za-zА-Яа-яЁё]+)*$",
    re.UNICODE,
)
CAR_MODEL_PATTERN = re.compile(r"^[A-Za-zА-Яа-яЁё0-9.\- ]+$", re.UNICODE)


def normalize_phone(value: str) -> str:
    trimmed = value.strip()
    has_plus = trimmed.startswith("+")
    digits = re.sub(r"\D", "", trimmed)
    return f"+{digits}" if has_plus else digits


def normalize_person_name(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def normalize_car_model(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def validate_phone_number(value: str) -> str:
    normalized = normalize_phone(value)
    if not normalized:
        raise ValueError("Укажите телефон")
    if not PHONE_PATTERN.fullmatch(normalized):
        raise ValueError(
            "Телефон: только цифры и «+» в начале, 11–13 символов без пробелов"
        )
    return normalized


def validate_person_name(value: str) -> str:
    normalized = normalize_person_name(value)
    if not normalized:
        raise ValueError("Укажите имя")
    if len(normalized) < 2:
        raise ValueError("Имя должно содержать минимум 2 символа")
    if len(normalized) > 100:
        raise ValueError("Имя не должно превышать 100 символов")
    if not PERSON_NAME_PATTERN.fullmatch(normalized):
        raise ValueError(
            "Имя: только буквы (латиница или кириллица), пробел и дефис"
        )
    return normalized


def validate_car_model(value: str, *, required: bool = True) -> str:
    normalized = normalize_car_model(value)
    if not normalized:
        if required:
            raise ValueError("Укажите модель автомобиля")
        return ""
    if len(normalized) < 2:
        raise ValueError("Модель должна содержать минимум 2 символа")
    if len(normalized) > 100:
        raise ValueError("Модель не должна превышать 100 символов")
    if not CAR_MODEL_PATTERN.fullmatch(normalized):
        raise ValueError("Модель: буквы, цифры, пробел, дефис и точка")
    if re.search(r"\s{2,}", value.strip()):
        raise ValueError("Не более одного пробела подряд")
    if not re.search(r"[A-Za-zА-Яа-яЁё]", normalized):
        raise ValueError("Укажите модель, например BMW 5 Series 2020 или БМВ 5")
    return normalized
