import csv
import io
from dataclasses import dataclass

from sqlalchemy import or_
from sqlalchemy.orm import Query, Session, joinedload

from app.models.content import Category
from app.models.product import Product
from app.services.admin_list_filters import normalize_search_query

MAX_EXPORT_ROWS = 10_000


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


def _category_name_map(db: Session) -> dict[str, str]:
    rows = db.query(Category.id, Category.name).all()
    return {category_id: name for category_id, name in rows}


def export_products_csv(db: Session, filters: ProductListFilters) -> tuple[bytes, int]:
    products = (
        _build_products_query(db, filters)
        .options(*_product_list_options())
        .limit(MAX_EXPORT_ROWS)
        .all()
    )
    category_names = _category_name_map(db)

    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(
        [
            "ID",
            "Бренд",
            "Название",
            "Категория",
            "Цена (BYN)",
            "Цена со скидкой (BYN)",
            "Наличие",
            "Краткие характеристики",
        ]
    )

    for product in products:
        writer.writerow(
            [
                product.id,
                product.brand,
                product.name,
                category_names.get(product.category, product.category),
                f"{product.price:.2f}",
                f"{product.sale_price:.2f}" if product.sale_price is not None else "",
                "В наличии" if product.in_stock else "Под заказ",
                product.specs_short,
            ]
        )

    return buffer.getvalue().encode("utf-8"), len(products)
