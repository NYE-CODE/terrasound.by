from __future__ import annotations

from typing import Any

from fastapi import Request
from sqlalchemy import or_
from sqlalchemy.orm import Query, Session

from app.models.attribute import ProductAttributeValue
from app.models.product import Product


def parse_attribute_filters(request: Request) -> dict[str, Any]:
    filters: dict[str, Any] = {}
    for key, value in request.query_params.multi_items():
        if not key.startswith("attr."):
            continue
        body = key[5:]
        if body.endswith(".min"):
            attr_id = body[:-4]
            filters.setdefault(attr_id, {})["min"] = float(value)
        elif body.endswith(".max"):
            attr_id = body[:-4]
            filters.setdefault(attr_id, {})["max"] = float(value)
        elif value.lower() in {"true", "false"}:
            filters[body] = value.lower() == "true"
        else:
            filters[body] = value
    return filters


def apply_attribute_filters(db: Session, query: Query, attr_filters: dict[str, Any]) -> Query:
    for attr_id, filter_value in attr_filters.items():
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
        else:
            conditions = [ProductAttributeValue.value_string == str(filter_value)]
            try:
                numeric = float(filter_value)
                conditions.append(ProductAttributeValue.value_number == numeric)
            except (TypeError, ValueError):
                pass
            subq = subq.filter(or_(*conditions))
        query = query.filter(Product.id.in_(subq))
    return query
