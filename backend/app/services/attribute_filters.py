"""Парсинг query-параметров фильтров каталога: attr.{id}, attr.{id}.min/.max, повторяющиеся ключи."""

from __future__ import annotations

import math
from typing import Any

from fastapi import Request
from sqlalchemy import or_
from sqlalchemy.orm import Query, Session

from app.models.attribute import ProductAttributeValue
from app.models.product import Product


def _parse_filter_number(raw: str) -> float:
    text = raw.strip()
    if not text:
        raise ValueError("Некорректное число в фильтре характеристик")
    try:
        value = float(text)
    except (TypeError, ValueError) as exc:
        raise ValueError("Некорректное число в фильтре характеристик") from exc
    if not math.isfinite(value):
        raise ValueError("Некорректное число в фильтре характеристик")
    return value


def _set_range_bound(filters: dict[str, Any], attr_id: str, bound: str, raw: str) -> None:
    if not attr_id:
        return
    current = filters.get(attr_id)
    if not isinstance(current, dict):
        current = {}
        filters[attr_id] = current
    current[bound] = _parse_filter_number(raw)


def parse_attribute_filters(request: Request) -> dict[str, Any]:
    filters: dict[str, Any] = {}
    for key, value in request.query_params.multi_items():
        if not key.startswith("attr."):
            continue
        body = key[5:]
        if not body:
            continue
        if body.endswith(".min"):
            _set_range_bound(filters, body[:-4], "min", value)
        elif body.endswith(".max"):
            _set_range_bound(filters, body[:-4], "max", value)
        elif value.lower() in {"true", "false"}:
            if body not in filters or not isinstance(filters.get(body), dict):
                filters[body] = value.lower() == "true"
        else:
            _append_filter_value(filters, body, value)
    return filters


def _append_filter_value(filters: dict[str, Any], attr_id: str, value: str) -> None:
    if not attr_id:
        return
    existing = filters.get(attr_id)
    if isinstance(existing, dict):
        return
    if "," in value and existing is None:
        parts = [part.strip() for part in value.split(",") if part.strip()]
        if len(parts) > 1:
            filters[attr_id] = parts
            return
    if existing is None:
        filters[attr_id] = value
    elif isinstance(existing, list):
        existing.append(value)
    else:
        filters[attr_id] = [existing, value]


def apply_attribute_filters(db: Session, query: Query, attr_filters: dict[str, Any]) -> Query:
    for attr_id, filter_value in attr_filters.items():
        if not attr_id:
            continue
        if isinstance(filter_value, dict):
            if "min" not in filter_value and "max" not in filter_value:
                continue
        subq = db.query(ProductAttributeValue.product_id).filter(
            ProductAttributeValue.attribute_id == attr_id
        )
        if isinstance(filter_value, dict):
            if "min" in filter_value:
                subq = subq.filter(ProductAttributeValue.value_number >= filter_value["min"])
            if "max" in filter_value:
                subq = subq.filter(ProductAttributeValue.value_number <= filter_value["max"])
        elif isinstance(filter_value, bool):
            subq = subq.filter(ProductAttributeValue.value_bool.is_(filter_value))
        elif isinstance(filter_value, list):
            values = [str(item) for item in filter_value]
            subq = subq.filter(ProductAttributeValue.value_string.in_(values))
        else:
            conditions = [ProductAttributeValue.value_string == str(filter_value)]
            try:
                numeric = float(filter_value)
                if math.isfinite(numeric):
                    conditions.append(ProductAttributeValue.value_number == numeric)
            except (TypeError, ValueError):
                pass
            subq = subq.filter(or_(*conditions))
        query = query.filter(Product.id.in_(subq))
    return query
