import re

PHONE_PATTERN = re.compile(r"^(\+\d{10,12}|\d{11,13})$")
PHONE_LETTERS_PATTERN = re.compile(r"[A-Za-zА-Яа-яЁё]", re.UNICODE)
PHONE_ALLOWED_CHARS_PATTERN = re.compile(r"^[\d+\s\-()]+$")
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
    trimmed = value.strip()
    if not trimmed:
        raise ValueError("Укажите телефон")
    if PHONE_LETTERS_PATTERN.search(trimmed):
        raise ValueError("В номере не должно быть букв")
    if not PHONE_ALLOWED_CHARS_PATTERN.fullmatch(trimmed):
        raise ValueError("Неверный формат телефона")

    plus_count = trimmed.count("+")
    if plus_count > 1 or (plus_count == 1 and not trimmed.startswith("+")):
        raise ValueError("«+» только в начале номера")

    normalized = normalize_phone(trimmed)
    digit_count = len(re.sub(r"\D", "", normalized))
    if digit_count < 11:
        raise ValueError("Номер слишком короткий")
    if digit_count > 13:
        raise ValueError("Номер слишком длинный")
    if not PHONE_PATTERN.fullmatch(normalized):
        raise ValueError("Неверный формат телефона")
    return normalized


def validate_person_name(value: str) -> str:
    normalized = normalize_person_name(value)
    if not normalized:
        raise ValueError("Укажите имя")
    if len(normalized) < 2:
        raise ValueError("Минимум 2 символа")
    if len(normalized) > 100:
        raise ValueError("Слишком длинное имя")
    if re.search(r"\d", normalized):
        raise ValueError("Имя не может содержать цифры")
    if not PERSON_NAME_PATTERN.fullmatch(normalized):
        raise ValueError("Только буквы, пробел и дефис")
    return normalized


def validate_car_model(value: str, *, required: bool = True) -> str:
    normalized = normalize_car_model(value)
    if not normalized:
        if required:
            raise ValueError("Укажите модель авто")
        return ""
    if len(normalized) < 2:
        raise ValueError("Минимум 2 символа")
    if len(normalized) > 100:
        raise ValueError("Слишком длинная модель")
    if not CAR_MODEL_PATTERN.fullmatch(normalized):
        raise ValueError("Недопустимые символы в модели")
    if re.search(r"\s{2,}", value.strip()):
        raise ValueError("Уберите лишние пробелы")
    if not re.search(r"[A-Za-zА-Яа-яЁё]", normalized):
        raise ValueError("Пример: BMW 5 Series")
    return normalized
