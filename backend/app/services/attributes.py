from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

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
        raise HTTPException(status_code=400, detail="Атрибут с таким ID уже существует")
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
    db.commit()
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
    if payload.options is not None:
        option_count = len(payload.options)

    if "filter_type" in data or "value_type" in data or payload.options is not None:
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
        if attribute.value_type != "enum":
            raise HTTPException(status_code=400, detail="Опции доступны только для enum-атрибутов")
        _sync_options(db, attribute, payload.options)
    elif "value_type" in data and data["value_type"] != "enum":
        _sync_options(db, attribute, [])

    db.commit()
    return get_attribute_or_404(db, attribute_id)


def delete_attribute(db: Session, attribute_id: str) -> None:
    attribute = get_attribute_or_404(db, attribute_id)
    category_links = db.query(CategoryAttribute).filter(CategoryAttribute.attribute_id == attribute_id).count()
    if category_links:
        raise HTTPException(status_code=409, detail="Атрибут используется в категориях")
    product_values = (
        db.query(ProductAttributeValue).filter(ProductAttributeValue.attribute_id == attribute_id).count()
    )
    if product_values:
        raise HTTPException(
            status_code=409,
            detail=f"Атрибут используется в {product_values} товар(ах). Сначала уберите его из товаров.",
        )
    db.delete(attribute)
    db.commit()


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
        raise HTTPException(status_code=400, detail="Атрибут уже привязан к категории")
    link_data = payload.model_dump()
    link_data["filter_type"] = filter_type if payload.show_in_filters else None
    link = CategoryAttribute(category_id=category_id, **link_data)
    db.add(link)
    db.commit()
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
    for field, value in patch.items():
        setattr(link, field, value)
    db.commit()
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
    db.commit()


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


def get_category_filters(db: Session, category_id: str) -> CategoryFiltersOut:
    _ensure_category(db, category_id)
    links = list_category_attributes(db, category_id)
    filters = [
        CategoryFilterOut(
            attribute_id=link.attribute_id,
            label=link.attribute_label,
            value_type=link.value_type,
            filter_type=link.filter_type or "dropdown",
            unit=link.unit,
            options=link.options,
            filter_min=link.filter_min,
            filter_max=link.filter_max,
            filter_step=link.filter_step,
            group_label=link.group_label,
            sort_order=link.sort_order,
        )
        for link in links
        if link.show_in_filters and link.filter_type
    ]
    from sqlalchemy import func

    from app.services.products import effective_price_expr

    price_stats = (
        db.query(
            func.min(effective_price_expr()).label("min_price"),
            func.max(effective_price_expr()).label("max_price"),
        )
        .filter(Product.category == category_id)
        .one()
    )
    price_min = float(price_stats.min_price or 0)
    price_max = float(price_stats.max_price or 5000)
    if price_max <= price_min:
        price_max = max(price_min + 100, 5000)

    return CategoryFiltersOut(
        category_id=category_id,
        price_min=price_min,
        price_max=price_max,
        filters=filters,
    )


def attribute_value_to_api(value: ProductAttributeValue) -> Any:
    if value.value_bool is not None:
        return value.value_bool
    if value.value_number is not None:
        return value.value_number
    return value.value_string


def product_attributes_dict(db: Session, product_id: str) -> dict[str, Any]:
    rows = db.query(ProductAttributeValue).filter(ProductAttributeValue.product_id == product_id).all()
    return {row.attribute_id: attribute_value_to_api(row) for row in rows}


def validate_and_normalize_attributes(
    db: Session,
    category_id: str,
    attributes: dict[str, Any] | None,
) -> dict[str, ProductAttributeValue]:
    if not attributes:
        attributes = {}

    links = (
        db.query(CategoryAttribute)
        .options(joinedload(CategoryAttribute.attribute).joinedload(Attribute.options))
        .filter(CategoryAttribute.category_id == category_id, CategoryAttribute.show_in_form.is_(True))
        .all()
    )
    link_by_id = {link.attribute_id: link for link in links}
    result: dict[str, ProductAttributeValue] = {}

    for link in links:
        attr = link.attribute
        raw = attributes.get(attr.id)
        if raw is None or raw == "":
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
                value.value_number = float(raw)
            except (TypeError, ValueError) as exc:
                raise HTTPException(status_code=400, detail=f"Некорректное число в «{attr.label}»") from exc
        elif attr.value_type == "enum":
            allowed = {opt.value for opt in attr.options}
            if str(raw) not in allowed:
                raise HTTPException(status_code=400, detail=f"Недопустимое значение «{attr.label}»")
            value.value_string = str(raw)
        else:
            value.value_string = str(raw)
        result[attr.id] = value

    unknown = set(attributes.keys()) - set(link_by_id.keys())
    if unknown:
        raise HTTPException(status_code=400, detail=f"Неизвестные атрибуты: {', '.join(sorted(unknown))}")

    return result


def sync_product_attributes(
    db: Session, product: Product, normalized: dict[str, ProductAttributeValue]
) -> None:
    for row in list(product.attribute_values):
        db.delete(row)
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
