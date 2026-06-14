from typing import Annotated

from fastapi import APIRouter, File, Query, UploadFile

from app.api_constants import ADMIN_V1_PREFIX
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.services.media import save_category_image, save_portfolio_image, save_product_image

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/uploads",
    tags=["admin-uploads"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.post("/categories")
async def upload_category_image(
    category_id: Annotated[str, Query(alias="categoryId", min_length=1, max_length=50)],
    file: Annotated[UploadFile, File()],
) -> dict[str, str]:
    url = await save_category_image(category_id, file)
    return {"url": url}


@router.post("/products")
async def upload_product_image(
    file: Annotated[UploadFile, File()],
    product_id: Annotated[str | None, Query(alias="productId")] = None,
) -> dict[str, str]:
    url = await save_product_image(product_id, file)
    return {"url": url}


@router.post("/portfolio")
async def upload_portfolio_image(
    file: Annotated[UploadFile, File()],
    portfolio_id: Annotated[str | None, Query(alias="portfolioId")] = None,
) -> dict[str, str]:
    url = await save_portfolio_image(portfolio_id, file)
    return {"url": url}
