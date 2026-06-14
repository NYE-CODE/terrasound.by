from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.product_highlights import ProductHighlightsOut, ProductHighlightsUpdate
from app.services.product_highlights import (
    get_or_create_product_highlights,
    product_highlights_to_out,
    update_product_highlights,
)

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/product-highlights",
    tags=["admin-product-highlights"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=ProductHighlightsOut)
def get_admin_product_highlights(
    db: Annotated[Session, Depends(get_db)],
) -> ProductHighlightsOut:
    return product_highlights_to_out(get_or_create_product_highlights(db))


@router.patch("", response_model=ProductHighlightsOut)
def patch_product_highlights(
    payload: ProductHighlightsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductHighlightsOut:
    return product_highlights_to_out(update_product_highlights(db, payload))
