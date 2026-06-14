from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.product_highlights import ProductHighlightsOut
from app.services.product_highlights import get_public_product_highlights

router = APIRouter(prefix=f"{API_V1_PREFIX}/product-highlights", tags=["product-highlights"])


@router.get("", response_model=ProductHighlightsOut)
def get_public_product_highlights_route(
    db: Annotated[Session, Depends(get_db)],
) -> ProductHighlightsOut:
    return get_public_product_highlights(db)
