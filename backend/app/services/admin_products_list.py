from dataclasses import dataclass

from sqlalchemy import or_
from sqlalchemy.orm import Query, Session, joinedload

from app.models.product import Product
from app.services.admin_list_filters import normalize_search_query


@dataclass(frozen=True)
class ProductListFilters:
    q: str | None = None
    category: str | None = None
    brand: str | None = None
    in_stock: bool | None = None


def _product_list_options():
    return (
        joinedload(Product.images),
        joinedload(Product.specs),
        joinedload(Product.compatibility),
        joinedload(Product.attribute_values),
    )


def _build_products_query(db: Session, filters: ProductListFilters) -> Query[Product]:
    query = db.query(Product)

    search = normalize_search_query(filters.q)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.id.ilike(pattern),
                Product.name.ilike(pattern),
                Product.brand.ilike(pattern),
                Product.specs_short.ilike(pattern),
            )
        )

    if filters.category:
        query = query.filter(Product.category == filters.category)

    if filters.brand:
        query = query.filter(Product.brand == filters.brand)

    if filters.in_stock is not None:
        query = query.filter(Product.in_stock.is_(filters.in_stock))

    return query.order_by(Product.name.asc())


def count_products(db: Session, filters: ProductListFilters) -> int:
    return _build_products_query(db, filters).count()


def list_products(
    db: Session,
    filters: ProductListFilters,
    *,
    limit: int,
    offset: int,
) -> list[Product]:
    return (
        _build_products_query(db, filters)
        .options(*_product_list_options())
        .offset(offset)
        .limit(limit)
        .all()
    )
