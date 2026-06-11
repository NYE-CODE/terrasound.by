from __future__ import annotations

from sqlalchemy.exc import IntegrityError


def integrity_error_detail(exc: IntegrityError) -> str:
    raw = str(exc.orig).lower() if exc.orig else str(exc).lower()

    if "unique constraint failed" in raw or "unique" in raw:
        if "attribute_options" in raw:
            return "Коды вариантов списка должны быть уникальными. Укажите латинский код: stock: Штатная АС"
        if "uq_category_attribute" in raw or "category_attributes" in raw:
            return "Эта характеристика уже привязана к категории."
        if "uq_product_attribute" in raw or "product_attribute_values" in raw:
            return "Конфликт значений характеристик товара."
        if "attributes.id" in raw or "attributes" in raw:
            return "Атрибут с таким кодом уже существует."
        if "categories.id" in raw or "categories" in raw:
            return "Категория с таким slug уже существует."
        if "products" in raw:
            return "Товар с такими данными уже существует."
        return "Такая запись уже существует."

    if "foreign key constraint failed" in raw or "foreign key" in raw:
        return "Нельзя выполнить операцию: есть связанные данные."

    return "Операция нарушает ограничения данных. Проверьте связанные записи."


def integrity_error_status(exc: IntegrityError) -> int:
    detail = integrity_error_detail(exc)
    if "уникальн" in detail.lower() or "уже существует" in detail.lower() or "уже привязана" in detail.lower():
        return 409
    if "коды вариантов" in detail.lower():
        return 400
    return 409
