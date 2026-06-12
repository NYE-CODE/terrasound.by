from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.cache import CATALOG_PRICE_BOUNDS, PRODUCT_BRANDS, content_cache
from app.database import get_db
from app.models.product import Product
from app.schemas.attribute import PriceBoundsOut
from app.services.products import query_price_bounds

router = APIRouter(prefix=f"{API_V1_PREFIX}/catalog", tags=["catalog"])


@router.get("/price-bounds", response_model=PriceBoundsOut)
def catalog_price_bounds(db: Annotated[Session, Depends(get_db)]) -> PriceBoundsOut:
    def load() -> dict:
        lo, hi = query_price_bounds(db)
        return PriceBoundsOut(price_min=lo, price_max=hi).model_dump(by_alias=True)

    data = content_cache.get(CATALOG_PRICE_BOUNDS, load)
    return PriceBoundsOut.model_validate(data)


@router.get("/brands", response_model=list[str])
def list_catalog_brands(db: Annotated[Session, Depends(get_db)]) -> list[str]:
    def load() -> list[str]:
        rows = db.query(Product.brand).distinct().order_by(Product.brand).all()
        return [row[0] for row in rows]

    return content_cache.get(PRODUCT_BRANDS, load)
