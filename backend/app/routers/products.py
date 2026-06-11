from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductDetailOut, ProductListOut
from app.services.attribute_filters import parse_attribute_filters
from app.services.products import get_product_or_404, list_products, product_to_detail

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/brands", response_model=list[str])
def list_product_brands(db: Annotated[Session, Depends(get_db)]) -> list[str]:
    rows = (
        db.query(Product.brand)
        .filter(Product.in_stock.is_(True))
        .distinct()
        .order_by(Product.brand)
        .all()
    )
    return [row[0] for row in rows]


@router.get("", response_model=ProductListOut)
def list_products_route(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    category: str | None = Query(default=None, max_length=50),
    brand: str | None = Query(default=None, max_length=100),
    brands: list[str] | None = Query(default=None, max_length=20),
    make: str | None = Query(default=None, max_length=50),
    model: str | None = Query(default=None, max_length=50),
    year: int | None = Query(default=None, ge=1980, le=2035),
    price_min: float | None = Query(default=None, alias="priceMin", ge=0),
    price_max: float | None = Query(default=None, alias="priceMax", ge=0),
    sort: str = Query(default="popularity", max_length=20),
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ProductListOut:
    return list_products(
        db,
        category=category,
        brand=brand,
        brands=brands,
        make=make,
        model=model,
        year=year,
        price_min=price_min,
        price_max=price_max,
        attr_filters=parse_attribute_filters(request),
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_product(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductDetailOut:
    product = get_product_or_404(db, product_id)
    return product_to_detail(db, product)
