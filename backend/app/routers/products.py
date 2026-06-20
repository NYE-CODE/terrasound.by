from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.pagination import PaginatedOut
from app.schemas.product import ProductCardOut, ProductDetailOut
from app.services.attribute_filters import parse_attribute_filters
from app.services.products import (
    PUBLIC_PRODUCT_LIST_DEFAULT_LIMIT,
    PUBLIC_PRODUCT_LIST_MAX_LIMIT,
    SORT_OPTIONS,
    get_product_or_404,
    list_products,
    product_to_detail,
)

router = APIRouter(prefix=f"{API_V1_PREFIX}/products", tags=["products"])


@router.get("", response_model=PaginatedOut[ProductCardOut])
def list_products_route(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    category: str | None = Query(default=None, max_length=50),
    brand: str | None = Query(default=None, max_length=100),
    brands: list[str] | None = Query(default=None, max_length=20),
    price_min: float | None = Query(default=None, alias="priceMin", ge=0),
    price_max: float | None = Query(default=None, alias="priceMax", ge=0),
    in_stock: list[bool] | None = Query(default=None, alias="inStock"),
    sort: str = Query(default="popularity", max_length=20),
    limit: int = Query(default=PUBLIC_PRODUCT_LIST_DEFAULT_LIMIT, ge=1, le=PUBLIC_PRODUCT_LIST_MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ProductCardOut]:
    """Каталог товаров с фильтрами (attr.*) и характеристиками."""
    if sort not in SORT_OPTIONS:
        raise HTTPException(status_code=422, detail="Некорректная сортировка")
    try:
        attr_filters = parse_attribute_filters(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return list_products(
        db,
        category=category,
        brand=brand,
        brands=brands,
        price_min=price_min,
        price_max=price_max,
        in_stock=in_stock,
        attr_filters=attr_filters,
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
