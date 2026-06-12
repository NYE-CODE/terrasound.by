from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.cache import PRODUCT_BRANDS, content_cache
from app.database import get_db
from app.models.product import Product

router = APIRouter(prefix=f"{API_V1_PREFIX}/catalog", tags=["catalog"])


@router.get("/brands", response_model=list[str])
def list_catalog_brands(db: Annotated[Session, Depends(get_db)]) -> list[str]:
    def load() -> list[str]:
        rows = db.query(Product.brand).distinct().order_by(Product.brand).all()
        return [row[0] for row in rows]

    return content_cache.get(PRODUCT_BRANDS, load)
