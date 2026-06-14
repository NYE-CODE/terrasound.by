from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api_constants import API_V2_PREFIX
from app.cache import CATALOG_PRICE_BOUNDS, PRODUCT_BRANDS, content_cache
from app.database import get_db
from app.models.product import Product
from app.schemas.attribute import PriceBoundsOut
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
    query_price_bounds,
)

router = APIRouter(prefix=f"{API_V2_PREFIX}/products", tags=["products"])


@router.get("/facets/brands", response_model=list[str])
def product_facet_brands_v2(db: Annotated[Session, Depends(get_db)]) -> list[str]:
    def load() -> list[str]:
        rows = db.query(Product.brand).distinct().order_by(Product.brand).all()
        return [row[0] for row in rows]

    return content_cache.get(PRODUCT_BRANDS, load)


@router.get("/facets/price-bounds", response_model=PriceBoundsOut)
def product_facet_price_bounds_v2(db: Annotated[Session, Depends(get_db)]) -> PriceBoundsOut:
    def load() -> dict:
        lo, hi = query_price_bounds(db)
        return PriceBoundsOut(price_min=lo, price_max=hi).model_dump(by_alias=True)

    data = content_cache.get(CATALOG_PRICE_BOUNDS, load)
    return PriceBoundsOut.model_validate(data)


@router.get("", response_model=PaginatedOut[ProductCardOut])
def list_products_v2(
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
    in_stock: list[bool] | None = Query(default=None, alias="inStock"),
    sort: str = Query(default="popularity", max_length=20),
    limit: int = Query(default=PUBLIC_PRODUCT_LIST_DEFAULT_LIMIT, ge=1, le=PUBLIC_PRODUCT_LIST_MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ProductCardOut]:
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
        make=make,
        model=model,
        year=year,
        price_min=price_min,
        price_max=price_max,
        in_stock=in_stock,
        attr_filters=attr_filters,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_product_v2(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductDetailOut:
    product = get_product_or_404(db, product_id)
    return product_to_detail(db, product)
