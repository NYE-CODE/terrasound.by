import re

from sqlalchemy.orm import Query, Session

from app.data.vehicles import VEHICLE_CATALOG
from app.models.product import Product, ProductCompatibility


def get_vehicle_labels(make_id: str, model_id: str) -> tuple[str, str] | None:
    for make in VEHICLE_CATALOG:
        if make["id"] != make_id:
            continue
        for model in make["models"]:
            if model["id"] == model_id:
                return make["name"], model["name"]
    return None


def matches_vehicle_compatibility(vehicle: str, make_name: str, model_name: str, year: int) -> bool:
    text = vehicle.lower()
    if make_name.lower() not in text:
        return False
    if model_name.lower() not in text:
        return False
    match = re.search(r"\((\d{4})-(\d{4})\)", vehicle)
    if not match:
        return True
    return int(match.group(1)) <= year <= int(match.group(2))


def matching_product_ids(db: Session, make_id: str, model_id: str, year: int) -> set[str]:
    labels = get_vehicle_labels(make_id, model_id)
    if not labels:
        return set()

    make_name, model_name = labels
    ids: set[str] = set()
    rows = db.query(ProductCompatibility.product_id, ProductCompatibility.vehicle).all()
    for product_id, vehicle in rows:
        if matches_vehicle_compatibility(vehicle, make_name, model_name, year):
            ids.add(product_id)
    return ids


def apply_vehicle_filter(
    db: Session,
    query: Query,
    make_id: str | None,
    model_id: str | None,
    year: int | None,
) -> Query:
    if not (make_id and model_id and year is not None):
        return query

    product_ids = matching_product_ids(db, make_id, model_id, year)
    if not product_ids:
        return query.filter(Product.id == "__none__")
    return query.filter(Product.id.in_(product_ids))
