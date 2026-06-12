import math

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session, joinedload, load_only

from app.models.product import Product
from app.models.review import ProductReview
from app.schemas.pagination import PaginatedOut, paginated
from app.schemas.product import ProductCardOut, ProductDetailOut
from app.schemas.review import ProductReviewPublicOut
from app.services.attribute_filters import apply_attribute_filters
from app.money import round_money
from app.services.attributes import product_attribute_specs, product_attributes_dict_from_rows
from app.services.compatibility import apply_vehicle_filter

SORT_OPTIONS = frozenset({"popularity", "price-low", "price-high", "new", "rating"})
PUBLIC_PRODUCT_LIST_DEFAULT_LIMIT = 50
PUBLIC_PRODUCT_LIST_MAX_LIMIT = 100


def effective_price_expr():
    return case(
        (
            and_(
                Product.sale_price.isnot(None),
                Product.sale_price > 0,
                Product.sale_price < Product.price,
            ),
            Product.sale_price,
        ),
        else_=Product.price,
    )


def effective_price(product: Product) -> float:
    if product.sale_price is not None and 0 < product.sale_price < product.price:
        return product.sale_price
    return product.price


def normalize_price_slider_bounds(
    min_price: float | None,
    max_price: float | None,
) -> tuple[float, float]:
    """Границы ценового слайдера по min/max effective price (округление max до сотен)."""
    lo = float(min_price or 0)
    if max_price is None:
        return lo, lo
    hi = float(max_price)
    if hi <= lo:
        return lo, lo + 100.0 if lo > 0 else 0.0
    return lo, math.ceil(hi / 100) * 100


def query_price_bounds(db: Session, *, category_id: str | None = None) -> tuple[float, float]:
    query = db.query(
        func.min(effective_price_expr()).label("min_price"),
        func.max(effective_price_expr()).label("max_price"),
    )
    if category_id is not None:
        query = query.filter(Product.category == category_id)
    row = query.one()
    return normalize_price_slider_bounds(row.min_price, row.max_price)


def _review_stats(product: Product) -> tuple[float | None, int]:
    published = [review for review in product.reviews if review.published]
    if not published:
        return None, 0
    avg = round(sum(review.rating for review in published) / len(published), 1)
    return avg, len(published)


def product_to_card(
    product: Product,
    rating_avg: float | None = None,
    review_count: int | None = None,
) -> ProductCardOut:
    if rating_avg is None and review_count is None:
        rating_avg, review_count = _review_stats(product)
    else:
        review_count = review_count or 0
        if rating_avg is not None:
            rating_avg = round(float(rating_avg), 1)

    return ProductCardOut(
        id=product.id,
        brand=product.brand,
        name=product.name,
        specs=product.specs_short,
        price=round_money(product.price),
        sale_price=round_money(product.sale_price) if product.sale_price is not None else None,
        image=product.image_url,
        category=product.category,
        in_stock=product.in_stock,
        rating_avg=rating_avg,
        review_count=review_count,
        created_at=product.created_at,
    )


def _review_stats_subquery(db: Session):
    return (
        db.query(
            ProductReview.product_id.label("product_id"),
            func.avg(ProductReview.rating).label("rating_avg"),
            func.count(ProductReview.id).label("review_count"),
        )
        .filter(ProductReview.published.is_(True))
        .group_by(ProductReview.product_id)
        .subquery()
    )


def _apply_product_filters(
    db: Session,
    query,
    *,
    category: str | None,
    brand: str | None,
    brands: list[str] | None,
    make: str | None,
    model: str | None,
    year: int | None,
    price_min: float | None,
    price_max: float | None,
    in_stock: list[bool] | None = None,
    attr_filters: dict | None = None,
):
    if category:
        query = query.filter(Product.category == category)
    if brands:
        # Совпадает с max_length=20 на query-параметре — защита от огромного IN().
        query = query.filter(Product.brand.in_(brands[:20]))
    elif brand:
        query = query.filter(Product.brand == brand)

    effective = effective_price_expr()
    if price_min is not None:
        query = query.filter(effective >= price_min)
    if price_max is not None:
        query = query.filter(effective <= price_max)

    if in_stock:
        unique = set(in_stock)
        if len(unique) == 1:
            query = query.filter(Product.in_stock.is_(next(iter(unique))))

    query = apply_vehicle_filter(db, query, make, model, year)
    if attr_filters:
        query = apply_attribute_filters(db, query, attr_filters)
    return query


def _apply_product_sort(query, sort: str, review_stats):
    effective = effective_price_expr()
    if sort == "price-low":
        return query.order_by(effective.asc(), Product.name.asc())
    if sort == "price-high":
        return query.order_by(effective.desc(), Product.name.asc())
    if sort == "new":
        return query.order_by(Product.created_at.desc(), Product.name.asc())
    if sort == "rating":
        return query.order_by(
            func.coalesce(review_stats.c.rating_avg, 0).desc(),
            Product.name.asc(),
        )
    return query.order_by(Product.name.asc())


def list_products(
    db: Session,
    *,
    category: str | None = None,
    brand: str | None = None,
    brands: list[str] | None = None,
    make: str | None = None,
    model: str | None = None,
    year: int | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    in_stock: list[bool] | None = None,
    attr_filters: dict | None = None,
    sort: str = "popularity",
    limit: int = PUBLIC_PRODUCT_LIST_DEFAULT_LIMIT,
    offset: int = 0,
) -> PaginatedOut[ProductCardOut]:
    """Публичный список товаров с фильтрами, сортировкой и пагинацией."""
    if sort not in SORT_OPTIONS:
        sort = "popularity"
    limit = min(max(limit, 1), PUBLIC_PRODUCT_LIST_MAX_LIMIT)

    count_query = db.query(func.count(Product.id))
    count_query = _apply_product_filters(
        db,
        count_query,
        category=category,
        brand=brand,
        brands=brands,
        make=make,
        model=model,
        year=year,
        price_min=price_min,
        price_max=price_max,
        in_stock=in_stock,
        attr_filters=attr_filters,
    )
    total = count_query.scalar() or 0

    review_stats = _review_stats_subquery(db)
    query = (
        db.query(Product, review_stats.c.rating_avg, review_stats.c.review_count)
        .options(
            load_only(
                Product.id,
                Product.brand,
                Product.name,
                Product.price,
                Product.sale_price,
                Product.image_url,
                Product.category,
                Product.in_stock,
                Product.specs_short,
                Product.created_at,
            )
        )
        .outerjoin(review_stats, Product.id == review_stats.c.product_id)
    )
    query = _apply_product_filters(
        db,
        query,
        category=category,
        brand=brand,
        brands=brands,
        make=make,
        model=model,
        year=year,
        price_min=price_min,
        price_max=price_max,
        in_stock=in_stock,
        attr_filters=attr_filters,
    )
    query = _apply_product_sort(query, sort, review_stats)

    if offset:
        query = query.offset(offset)
    query = query.limit(limit)

    rows = query.all()
    items = [
        product_to_card(product, rating_avg=rating_avg, review_count=review_count)
        for product, rating_avg, review_count in rows
    ]
    return paginated(items, total=total, limit=limit, offset=offset)


def product_to_detail(
    db: Session,
    product: Product,
    reviews: list[ProductReview] | None = None,
) -> ProductDetailOut:
    images = [img.url for img in sorted(product.images, key=lambda i: i.sort_order)]
    if not images:
        images = [product.image_url]

    review_list = reviews if reviews is not None else [r for r in product.reviews if r.published]
    rating_avg, review_count = _review_stats(product)

    return ProductDetailOut(
        id=product.id,
        brand=product.brand,
        name=product.name,
        price=round_money(product.price),
        sale_price=round_money(product.sale_price) if product.sale_price is not None else None,
        images=images,
        specs={spec.key: spec.value for spec in product.specs},
        attributes=product_attributes_dict_from_rows(list(product.attribute_values)),
        attribute_specs=product_attribute_specs(db, product),
        compatibility=[item.vehicle for item in product.compatibility],
        reviews=[ProductReviewPublicOut.model_validate(r) for r in review_list],
        in_stock=product.in_stock,
        rating_avg=rating_avg,
        review_count=review_count,
    )


def get_product_or_404(db: Session, product_id: str) -> Product:
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
            joinedload(Product.reviews),
            joinedload(Product.attribute_values),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Товар не найден")
    return product
