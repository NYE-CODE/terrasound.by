from __future__ import annotations

import math
from typing import Any

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.cache import invalidate_category_filters_cache
from app.db_commit import commit_or_raise

from app.filter_types import allowed_filter_types, effective_filter_type, resolve_default_filter_type
from app.models.attribute import Attribute, AttributeOption, CategoryAttribute, ProductAttributeValue
from app.models.content import Category
from app.models.product import Product
from app.schemas.attribute import (
    AttributeCreate,
    AttributeOptionOut,
    AttributeOut,
    AttributeUpdate,
    CategoryAttributeCreate,
    CategoryAttributeOut,
    CategoryAttributeSchemaOut,
    CategoryAttributeSyncItem,
    CategoryAttributeUpdate,
    CategoryFilterOut,
    CategoryFiltersOut,
)


def _options_out(attribute: Attribute) -> list[AttributeOptionOut]:
    return [
        AttributeOptionOut(value=opt.value, label=opt.label, sort_order=opt.sort_order)
        for opt in sorted(attribute.options, key=lambda o: o.sort_order)
    ]


def attribute_to_out(attribute: Attribute) -> AttributeOut:
    option_count = len(attribute.options)
    filter_type = attribute.filter_type or resolve_default_filter_type(attribute.value_type, option_count)
    return AttributeOut(
        id=attribute.id,
        label=attribute.label,
        value_type=attribute.value_type,
        unit=attribute.unit,
        filter_type=filter_type,
        options=_options_out(attribute),
    )


def _resolve_attribute_filter_type(
    value_type: str,
    option_count: int,
    filter_type: str | None,
) -> str | None:
    if filter_type:
        allowed = allowed_filter_types(value_type)
        if filter_type not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Вид фильтра «{filter_type}» недоступен для типа «{value_type}»",
            )
        return filter_type
    return resolve_default_filter_type(value_type, option_count)


def category_attribute_to_out(link: CategoryAttribute) -> CategoryAttributeOut:
    attr = link.attribute
    option_count = len(attr.options)
    filter_type = effective_filter_type(
        attr.value_type,
        option_count,
        attr.filter_type,
        link.filter_type,
    )
    return CategoryAttributeOut(
        id=link.id,
        category_id=link.category_id,
        attribute_id=link.attribute_id,
        attribute_label=attr.label,
        value_type=attr.value_type,
        unit=attr.unit,
        options=_options_out(attr),
        show_in_form=link.show_in_form,
        show_in_filters=link.show_in_filters,
        show_on_card=link.show_on_card,
        filter_type=filter_type,
        filter_min=link.filter_min,
        filter_max=link.filter_max,
        filter_step=link.filter_step,
        required=link.required,
        sort_order=link.sort_order,
        group_label=link.group_label,
    )


def list_attributes(db: Session) -> list[AttributeOut]:
    items = (
        db.query(Attribute)
        .options(joinedload(Attribute.options))
        .order_by(Attribute.label)
        .all()
    )
    return [attribute_to_out(item) for item in items]


def get_attribute_or_404(db: Session, attribute_id: str) -> Attribute:
    attribute = (
        db.query(Attribute)
        .options(joinedload(Attribute.options))
        .filter(Attribute.id == attribute_id)
        .first()
    )
    if not attribute:
        raise HTTPException(status_code=404, detail="Атрибут не найден")
    return attribute


def _validate_option_values(options: list) -> None:
    values = [option.value for option in options]
    if len(values) != len(set(values)):
        raise HTTPException(
            status_code=400,
            detail="Коды вариантов должны быть уникальными. Укажите латинский код через двоеточие: stock: Штатная АС",
        )
    for value in values:
        if not value or value.strip("_") == "":
            raise HTTPException(status_code=400, detail="У каждого варианта должен быть непустой код")


def _sync_options(db: Session, attribute: Attribute, options: list) -> None:
    _validate_option_values(options)
    for option in list(attribute.options):
        db.delete(option)
    db.flush()
    for index, option in enumerate(options):
        db.add(
            AttributeOption(
                attribute_id=attribute.id,
                value=option.value,
                label=option.label,
                sort_order=option.sort_order if option.sort_order else index,
            )
        )


def create_attribute(db: Session, payload: AttributeCreate) -> Attribute:
    if db.query(Attribute).filter(Attribute.id == payload.id).first():
        raise HTTPException(status_code=409, detail="Атрибут с таким ID уже существует")
    option_count = len(payload.options) if payload.value_type == "enum" else 0
    if payload.value_type == "enum" and option_count == 0:
        raise HTTPException(status_code=400, detail="Добавьте хотя бы один вариант списка")
    filter_type = _resolve_attribute_filter_type(payload.value_type, option_count, payload.filter_type)
    attribute = Attribute(
        id=payload.id,
        label=payload.label,
        value_type=payload.value_type,
        unit=payload.unit if payload.value_type == "number" else None,
        filter_type=filter_type,
    )
    db.add(attribute)
    db.flush()
    if payload.value_type == "enum":
        _sync_options(db, attribute, payload.options)
    commit_or_raise(db)
    return get_attribute_or_404(db, attribute.id)


def update_attribute(db: Session, attribute_id: str, payload: AttributeUpdate) -> Attribute:
    attribute = get_attribute_or_404(db, attribute_id)
    data = payload.model_dump(exclude_unset=True)
    data.pop("options", None)

    if "label" in data:
        attribute.label = data["label"]
    if "value_type" in data:
        attribute.value_type = data["value_type"]

    option_count = len(attribute.options)
    if payload.options is not None and attribute.value_type == "enum":
        option_count = len(payload.options)

    if "filter_type" in data or "value_type" in data or (
        payload.options is not None and attribute.value_type == "enum"
    ):
        requested = data.get("filter_type", attribute.filter_type)
        attribute.filter_type = _resolve_attribute_filter_type(
            attribute.value_type,
            option_count,
            requested,
        )

    if "unit" in data or "value_type" in data:
        if attribute.value_type == "number":
            attribute.unit = data.get("unit")
        else:
            attribute.unit = None

    if payload.options is not None:
        if attribute.value_type == "enum":
            _sync_options(db, attribute, payload.options)
        elif payload.options:
            raise HTTPException(status_code=400, detail="Опции доступны только для enum-атрибутов")
    elif "value_type" in data and data["value_type"] != "enum":
        _sync_options(db, attribute, [])

    commit_or_raise(db)
    return get_attribute_or_404(db, attribute_id)


def delete_attribute(db: Session, attribute_id: str, *, strategy: str = "default") -> None:
    attribute = get_attribute_or_404(db, attribute_id)
    category_links = db.query(CategoryAttribute).filter(CategoryAttribute.attribute_id == attribute_id).count()
    product_values = (
        db.query(ProductAttributeValue).filter(ProductAttributeValue.attribute_id == attribute_id).count()
    )

    if strategy != "cascade":
        if category_links:
            raise HTTPException(status_code=409, detail="Атрибут используется в категориях")
        if product_values:
            raise HTTPException(
                status_code=409,
                detail=f"Атрибут используется в {product_values} товар(ах). Сначала уберите его из товаров.",
            )
    else:
        db.query(ProductAttributeValue).filter(ProductAttributeValue.attribute_id == attribute_id).delete()
        db.query(CategoryAttribute).filter(CategoryAttribute.attribute_id == attribute_id).delete()
        db.flush()

    db.delete(attribute)
    commit_or_raise(db)


def _ensure_category(db: Session, category_id: str) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category


def list_category_attributes(db: Session, category_id: str) -> list[CategoryAttributeOut]:
    _ensure_category(db, category_id)
    links = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.category_id == category_id)
        .order_by(CategoryAttribute.sort_order)
        .all()
    )
    return [category_attribute_to_out(link) for link in links]


def create_category_attribute(
    db: Session, category_id: str, payload: CategoryAttributeCreate
) -> CategoryAttributeOut:
    _ensure_category(db, category_id)
    attr = get_attribute_or_404(db, payload.attribute_id)
    filter_type = effective_filter_type(
        attr.value_type,
        len(attr.options),
        attr.filter_type,
        payload.filter_type,
    )
    exists = (
        db.query(CategoryAttribute)
        .filter(
            CategoryAttribute.category_id == category_id,
            CategoryAttribute.attribute_id == payload.attribute_id,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Атрибут уже привязан к категории")
    _validate_filter_range(payload.filter_min, payload.filter_max)
    link_data = payload.model_dump()
    link_data["filter_type"] = filter_type if payload.show_in_filters else None
    link = CategoryAttribute(category_id=category_id, **link_data)
    db.add(link)
    commit_or_raise(db)
    invalidate_category_filters_cache(category_id)
    db.refresh(link)
    link = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.id == link.id)
        .one()
    )
    return category_attribute_to_out(link)


def update_category_attribute(
    db: Session, category_id: str, link_id: int, payload: CategoryAttributeUpdate
) -> CategoryAttributeOut:
    link = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.id == link_id, CategoryAttribute.category_id == category_id)
        .first()
    )
    if not link:
        raise HTTPException(status_code=404, detail="Привязка не найдена")
    patch = payload.model_dump(exclude_unset=True)
    if patch.get("show_in_filters") is True or (
        patch.get("show_in_filters") is None and link.show_in_filters
    ):
        attr = link.attribute
        patch["filter_type"] = effective_filter_type(
            attr.value_type,
            len(attr.options),
            attr.filter_type,
            patch.get("filter_type", link.filter_type),
        )
    elif patch.get("show_in_filters") is False:
        patch["filter_type"] = None
    next_min = patch.get("filter_min", link.filter_min)
    next_max = patch.get("filter_max", link.filter_max)
    _validate_filter_range(next_min, next_max)
    for field, value in patch.items():
        setattr(link, field, value)
    commit_or_raise(db)
    invalidate_category_filters_cache(category_id)
    db.refresh(link)
    return category_attribute_to_out(link)


def delete_category_attribute(db: Session, category_id: str, link_id: int) -> None:
    link = (
        db.query(CategoryAttribute)
        .filter(CategoryAttribute.id == link_id, CategoryAttribute.category_id == category_id)
        .first()
    )
    if not link:
        raise HTTPException(status_code=404, detail="Привязка не найдена")
    db.delete(link)
    commit_or_raise(db)
    invalidate_category_filters_cache(category_id)


def _apply_category_link_fields(
    link: CategoryAttribute,
    attr: Attribute,
    item: CategoryAttributeSyncItem,
    *,
    sort_order: int,
) -> None:
    filter_type = (
        effective_filter_type(
            attr.value_type,
            len(attr.options),
            attr.filter_type,
            item.filter_type,
        )
        if item.show_in_filters
        else None
    )
    group_label = item.group_label.strip() if item.group_label and item.group_label.strip() else None
    link.show_in_form = item.show_in_form
    link.show_in_filters = item.show_in_filters
    link.show_on_card = item.show_on_card
    link.filter_type = filter_type
    link.filter_min = item.filter_min
    link.filter_max = item.filter_max
    link.filter_step = item.filter_step
    link.required = item.required
    link.sort_order = sort_order
    link.group_label = group_label


def sync_category_attributes(
    db: Session,
    category_id: str,
    items: list[CategoryAttributeSyncItem],
) -> list[CategoryAttributeOut]:
    """Полная синхронизация привязок категории: payload — источник правды, лишние связи удаляются."""
    _ensure_category(db, category_id)

    seen_attributes: set[str] = set()
    for item in items:
        if item.attribute_id in seen_attributes:
            raise HTTPException(
                status_code=400,
                detail=f"Характеристика «{item.attribute_id}» добавлена дважды.",
            )
        seen_attributes.add(item.attribute_id)
        _validate_filter_range(item.filter_min, item.filter_max)

    existing = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.category_id == category_id)
        .all()
    )
    existing_by_id = {link.id: link for link in existing}
    keep_ids = {item.id for item in items if item.id is not None}

    for link in existing:
        if link.id not in keep_ids:
            db.delete(link)
    db.flush()  # Обязательно сбрасываем DELETE, чтобы последующий INSERT или query не конфликтовал

    for sort_order, item in enumerate(items):
        attr = get_attribute_or_404(db, item.attribute_id)

        if item.id is not None:
            link = existing_by_id.get(item.id)
            if link is None:
                raise HTTPException(status_code=404, detail="Привязка не найдена")
            if link.attribute_id != item.attribute_id:
                raise HTTPException(
                    status_code=400,
                    detail="Нельзя сменить характеристику у существующей привязки",
                )
            _apply_category_link_fields(link, attr, item, sort_order=sort_order)
            continue

        duplicate = (
            db.query(CategoryAttribute)
            .filter(
                CategoryAttribute.category_id == category_id,
                CategoryAttribute.attribute_id == item.attribute_id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=409, detail="Атрибут уже привязан к категории")

        link = CategoryAttribute(category_id=category_id, attribute_id=item.attribute_id)
        _apply_category_link_fields(link, attr, item, sort_order=sort_order)
        db.add(link)

    commit_or_raise(db)
    invalidate_category_filters_cache(category_id)
    return list_category_attributes(db, category_id)


def get_category_form_schema(db: Session, category_id: str) -> list[CategoryAttributeSchemaOut]:
    links = list_category_attributes(db, category_id)
    return [
        CategoryAttributeSchemaOut(
            attribute_id=link.attribute_id,
            label=link.attribute_label,
            value_type=link.value_type,
            unit=link.unit,
            options=link.options,
            required=link.required,
            sort_order=link.sort_order,
            group_label=link.group_label,
        )
        for link in links
        if link.show_in_form
    ]


def _attribute_bounds_for_category(
    db: Session,
    category_id: str,
    attribute_ids: list[str],
) -> dict[str, tuple[float, float]]:
    if not attribute_ids:
        return {}

    rows = (
        db.query(
            ProductAttributeValue.attribute_id,
            func.min(ProductAttributeValue.value_number),
            func.max(ProductAttributeValue.value_number),
        )
        .join(Product, Product.id == ProductAttributeValue.product_id)
        .filter(
            Product.category == category_id,
            ProductAttributeValue.attribute_id.in_(attribute_ids),
            ProductAttributeValue.value_number.isnot(None),
        )
        .group_by(ProductAttributeValue.attribute_id)
        .all()
    )
    bounds: dict[str, tuple[float, float]] = {}
    for attr_id, lo, hi in rows:
        data_min = float(lo) if lo is not None else 0.0
        data_max = float(hi) if hi is not None else data_min + 100.0
        bounds[attr_id] = (data_min, data_max)
    for attr_id in attribute_ids:
        bounds.setdefault(attr_id, (0.0, 100.0))
    return bounds


def get_category_filters(db: Session, category_id: str) -> CategoryFiltersOut:
    """Схема фильтров витрины для категории (цена + характеристики с авто-границами range)."""
    _ensure_category(db, category_id)
    links = list_category_attributes(db, category_id)
    range_needing_stats = [
        link.attribute_id
        for link in links
        if link.show_in_filters
        and link.filter_type == "range"
        and (link.filter_min is None or link.filter_max is None)
    ]
    stats_by_attribute = _attribute_bounds_for_category(db, category_id, range_needing_stats)

    filters: list[CategoryFilterOut] = []
    for link in links:
        if not (link.show_in_filters and link.filter_type):
            continue
        filter_min = link.filter_min
        filter_max = link.filter_max
        if link.filter_type == "range":
            filter_min, filter_max = _resolve_filter_bounds(
                link.filter_min,
                link.filter_max,
                stats_by_attribute.get(link.attribute_id),
            )
        filters.append(
            CategoryFilterOut(
                attribute_id=link.attribute_id,
                label=link.attribute_label,
                value_type=link.value_type,
                filter_type=link.filter_type or "dropdown",
                unit=link.unit,
                options=link.options,
                filter_min=filter_min,
                filter_max=filter_max,
                filter_step=link.filter_step,
                group_label=link.group_label,
                sort_order=link.sort_order,
            )
        )
    from app.services.products import effective_price_expr

    price_stats = (
        db.query(
            func.min(effective_price_expr()).label("min_price"),
            func.max(effective_price_expr()).label("max_price"),
        )
        .filter(Product.category == category_id)
        .one()
    )
    price_min, price_max = _category_price_bounds(price_stats.min_price, price_stats.max_price)

    return CategoryFiltersOut(
        category_id=category_id,
        price_min=price_min,
        price_max=price_max,
        filters=filters,
    )


def _category_price_bounds(min_price: float | None, max_price: float | None) -> tuple[float, float]:
    """Границы слайдера цены по фактическим ценам категории (без magic number)."""
    lo = float(min_price or 0)
    if max_price is None:
        return lo, lo
    hi = float(max_price)
    if hi <= lo:
        return lo, lo + 100.0 if lo > 0 else 0.0
    return lo, math.ceil(hi / 100) * 100


def attribute_value_to_api(value: ProductAttributeValue) -> Any:
    if value.value_bool is not None:
        return value.value_bool
    if value.value_number is not None:
        return value.value_number
    return value.value_string


def product_attributes_dict_from_rows(rows: list[ProductAttributeValue]) -> dict[str, Any]:
    return {row.attribute_id: attribute_value_to_api(row) for row in rows}


def product_attributes_dict(db: Session, product_id: str) -> dict[str, Any]:
    rows = db.query(ProductAttributeValue).filter(ProductAttributeValue.product_id == product_id).all()
    return product_attributes_dict_from_rows(rows)


def attribute_value_is_filled(value: ProductAttributeValue, attr: Attribute) -> bool:
    if attr.value_type == "boolean":
        return value.value_bool is not None
    if attr.value_type == "number":
        return value.value_number is not None
    if value.value_string is not None and value.value_string.strip() != "":
        return True
    return False


def format_attribute_display(attr: Attribute, raw: Any) -> str | None:
    if raw is None or raw == "":
        return None
    if attr.value_type == "boolean":
        return "Да" if raw else "Нет"
    if attr.value_type == "enum":
        for opt in attr.options:
            if opt.value == raw:
                return opt.label
        return str(raw).strip() or None
    if attr.value_type == "number":
        if isinstance(raw, float) and raw.is_integer():
            text = str(int(raw))
        else:
            text = str(raw)
        return f"{text} {attr.unit}".strip() if attr.unit else text
    text = str(raw).strip()
    return text or None


def product_attribute_specs(db: Session, product: Product) -> list:
    from app.schemas.product import ProductAttributeSpecOut

    links = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.category_id == product.category)
        .order_by(CategoryAttribute.sort_order)
        .all()
    )
    values = {value.attribute_id: value for value in product.attribute_values}
    specs: list[ProductAttributeSpecOut] = []

    for link in links:
        row = values.get(link.attribute_id)
        if not row or not attribute_value_is_filled(row, link.attribute):
            continue
        display = format_attribute_display(link.attribute, attribute_value_to_api(row))
        if not display or not str(display).strip():
            continue
        specs.append(
            ProductAttributeSpecOut(
                label=link.attribute.label,
                value=display,
                sort_order=link.sort_order,
            )
        )

    return specs


def clear_product_attribute_values(db: Session, product_id: str) -> None:
    db.query(ProductAttributeValue).filter(ProductAttributeValue.product_id == product_id).delete()


def _attribute_value_empty(raw: Any) -> bool:
    if raw is None:
        return True
    if isinstance(raw, str):
        return raw.strip() == ""
    if isinstance(raw, float):
        return not math.isfinite(raw)
    return raw == ""


def _validate_filter_range(filter_min: float | None, filter_max: float | None) -> None:
    if filter_min is None or filter_max is None:
        return
    if not math.isfinite(filter_min) or not math.isfinite(filter_max):
        raise HTTPException(status_code=400, detail="Некорректный диапазон фильтра")
    if filter_min >= filter_max:
        raise HTTPException(
            status_code=400,
            detail="Максимум ползунка должен быть больше минимума",
        )


def _resolve_filter_bounds(
    filter_min: float | None,
    filter_max: float | None,
    stats: tuple[float, float] | None = None,
) -> tuple[float, float]:
    both_explicit = filter_min is not None and filter_max is not None
    if both_explicit:
        lo, hi = float(filter_min), float(filter_max)
    else:
        data_min, data_max = stats if stats is not None else (0.0, 100.0)
        lo = float(filter_min) if filter_min is not None else data_min
        hi = float(filter_max) if filter_max is not None else data_max

    if not math.isfinite(lo):
        lo = 0.0
    if not math.isfinite(hi):
        hi = lo + 100.0
    if hi <= lo:
        # Явные min=max ломают ползунок — расширяем на 1; без явных границ — запас 100.
        hi = lo + (1.0 if both_explicit else 100.0)
    return lo, hi


def validate_and_normalize_attributes(
    db: Session,
    category_id: str,
    attributes: dict[str, Any] | None,
    *,
    product_id: str | None = None,
) -> dict[str, ProductAttributeValue]:
    """Проверяет значения характеристик товара по схеме категории и нормализует типы."""
    if not attributes:
        attributes = {}

    links = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.category_id == category_id, CategoryAttribute.show_in_form.is_(True))
        .all()
    )
    link_by_id = {link.attribute_id: link for link in links}
    # Игнорируем лишние ключи (фильтры, старые привязки) — валидируем только поля формы.
    attributes = {key: value for key, value in attributes.items() if key in link_by_id}

    if product_id:
        existing = product_attributes_dict(db, product_id)
        for link in links:
            attr_id = link.attribute_id
            # PATCH: пустое необязательное поле не затирает уже сохранённое значение.
            if _attribute_value_empty(attributes.get(attr_id)) and not link.required and attr_id in existing:
                attributes[attr_id] = existing[attr_id]

    result: dict[str, ProductAttributeValue] = {}

    for link in links:
        attr = link.attribute
        raw = attributes.get(attr.id)
        if _attribute_value_empty(raw):
            if link.required:
                raise HTTPException(status_code=400, detail=f"Заполните поле «{attr.label}»")
            continue
        value = ProductAttributeValue(attribute_id=attr.id, product_id="")
        if attr.value_type == "boolean":
            if isinstance(raw, bool):
                value.value_bool = raw
            elif str(raw).lower() in {"true", "1", "yes", "да"}:
                value.value_bool = True
            elif str(raw).lower() in {"false", "0", "no", "нет"}:
                value.value_bool = False
            else:
                raise HTTPException(status_code=400, detail=f"Некорректное значение «{attr.label}»")
        elif attr.value_type == "number":
            try:
                numeric = float(raw)
            except (TypeError, ValueError) as exc:
                raise HTTPException(status_code=400, detail=f"Некорректное число в «{attr.label}»") from exc
            if not math.isfinite(numeric):
                raise HTTPException(status_code=400, detail=f"Некорректное число в «{attr.label}»")
            value.value_number = numeric
        elif attr.value_type == "enum":
            allowed = {opt.value for opt in attr.options}
            if str(raw) not in allowed:
                raise HTTPException(status_code=400, detail=f"Недопустимое значение «{attr.label}»")
            value.value_string = str(raw)
        else:
            value.value_string = str(raw)
        result[attr.id] = value

    return result


def sync_product_attributes(
    db: Session,
    product: Product,
    normalized: dict[str, ProductAttributeValue],
    *,
    replace_all: bool = False,
) -> None:
    replace_ids = set(normalized.keys()) if not replace_all else None
    for row in list(product.attribute_values):
        if replace_all or row.attribute_id in replace_ids:
            db.delete(row)
    db.flush()  # Обязательно сбрасываем DELETE до INSERT, иначе будет 409 Conflict (uq_product_attribute)
    for attribute_id, value in normalized.items():
        db.add(
            ProductAttributeValue(
                product_id=product.id,
                attribute_id=attribute_id,
                value_string=value.value_string,
                value_number=value.value_number,
                value_bool=value.value_bool,
            )
        )
