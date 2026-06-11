"""Как характеристика отображается в фильтрах каталога."""

from __future__ import annotations

FILTER_TYPES = frozenset({"checkbox", "dropdown", "dropdown_multiselect", "multiselect", "range"})

FILTER_TYPE_LABELS = {
    "checkbox": "Галочка (да/нет)",
    "multiselect": "Список с галочками (несколько значений)",
    "dropdown_multiselect": "Выпадающий список с галочками (несколько значений)",
    "dropdown": "Выпадающий список (одно значение)",
    "range": "Ползунок «до…» (число)",
}


def resolve_default_filter_type(value_type: str, option_count: int = 0) -> str | None:
    """Автовыбор вида фильтра по типу значения атрибута."""
    if value_type == "boolean":
        return "checkbox"
    if value_type == "number":
        return "range"
    if value_type == "enum":
        # Ozon, Amazon, магазины автозвука: до ~12 вариантов — галочки, иначе select
        return "multiselect" if option_count <= 12 else "dropdown"
    return None


def allowed_filter_types(value_type: str) -> list[str]:
    if value_type == "boolean":
        return ["checkbox"]
    if value_type == "number":
        return ["range"]
    if value_type == "enum":
        return ["multiselect", "dropdown_multiselect", "dropdown"]
    return []


def effective_filter_type(
    value_type: str,
    option_count: int,
    attribute_filter_type: str | None,
    link_filter_type: str | None = None,
) -> str | None:
    """Итоговый вид фильтра: явный на атрибуте → legacy на привязке → автовыбор."""
    for candidate in (attribute_filter_type, link_filter_type):
        if candidate in FILTER_TYPES:
            return candidate
    return resolve_default_filter_type(value_type, option_count)
