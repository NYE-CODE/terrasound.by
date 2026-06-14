import re

STRONG_PASSWORD_MIN_LENGTH = 12
STRONG_PASSWORD_MAX_LENGTH = 128
STRONG_PASSWORD_HINT = (
    "Пароль должен быть не короче 12 символов и содержать строчные и заглавные буквы, "
    "цифру и спецсимвол"
)


def validate_strong_password(password: str) -> str:
    if len(password) < STRONG_PASSWORD_MIN_LENGTH or len(password) > STRONG_PASSWORD_MAX_LENGTH:
        raise ValueError(STRONG_PASSWORD_HINT)
    if not re.search(r"[a-z]", password):
        raise ValueError(STRONG_PASSWORD_HINT)
    if not re.search(r"[A-Z]", password):
        raise ValueError(STRONG_PASSWORD_HINT)
    if not re.search(r"\d", password):
        raise ValueError(STRONG_PASSWORD_HINT)
    if not re.search(r"[^\w\s]", password):
        raise ValueError(STRONG_PASSWORD_HINT)
    return password
