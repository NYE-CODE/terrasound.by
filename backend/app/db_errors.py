"""Маппинг текста constraint-ошибок SQLite/PostgreSQL в сообщения для клиента."""

from __future__ import annotations

import re

from sqlalchemy.exc import IntegrityError


def _raw_message(exc: IntegrityError) -> str:
    if exc.orig is not None:
        return str(exc.orig)
    return str(exc)


def integrity_error_detail(exc: IntegrityError) -> str:
    raw = _raw_message(exc)
    lowered = raw.lower()

    if "unique constraint failed" in lowered or "unique" in lowered or "duplicate key" in lowered:
        if "attribute_options" in lowered:
            return "Коды вариантов списка должны быть уникальными. Укажите латинский код: stock: Штатная АС"
        if "uq_category_attribute" in lowered or "category_attributes" in lowered:
            return "Эта характеристика уже привязана к категории."
        if "uq_product_attribute" in lowered or "product_attribute_values" in lowered:
            return "Конфликт значений характеристик товара."
        if "attributes.id" in lowered or re.search(r"\battributes\b", lowered):
            return "Атрибут с таким кодом уже существует."
        if "categories.id" in lowered or re.search(r"\bcategories\b", lowered):
            return "Категория с таким slug уже существует."
        if "products" in lowered:
            return "Товар с такими данными уже существует."
        return "Такая запись уже существует."

    if "foreign key constraint failed" in lowered or "foreign key" in lowered or "violates foreign key" in lowered:
        if "products" in lowered and "categories" in lowered:
            return "Нельзя удалить категорию: в ней есть товары. Перенесите или удалите их."
        if "product_reviews" in lowered or ("reviews" in lowered and "product" in lowered):
            return "Нельзя удалить товар: есть отзывы. Сначала удалите или скройте отзывы."
        if "product_attribute_values" in lowered:
            return "Нельзя удалить характеристику: она используется в товарах."
        if "category_attributes" in lowered:
            return "Нельзя удалить категорию: сначала отвяжите характеристики категории."
        if "attribute_options" in lowered:
            return "Нельзя удалить атрибут: варианты списка используются в данных."
        return "Нельзя выполнить операцию: есть связанные данные."

    return "Операция нарушает ограничения данных. Проверьте связанные записи."


def integrity_error_status(exc: IntegrityError) -> int:
    detail = integrity_error_detail(exc)
    lowered = detail.lower()
    if "уникальн" in lowered or "уже существует" in lowered or "уже привязана" in lowered:
        return 409
    if "коды вариантов" in lowered:
        return 400
    return 409
