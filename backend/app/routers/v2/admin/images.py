from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.api_constants import ADMIN_V2_PREFIX
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.upload import UploadUrlOut, UploadUrlResponse
from app.services.media import save_category_image, save_portfolio_image, save_product_image

router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}",
    tags=["admin-media"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.post("/categories/{category_id}/images", response_model=UploadUrlResponse)
async def upload_category_image_v2(
    category_id: str,
    file: Annotated[UploadFile, File()],
) -> UploadUrlResponse:
    url = await save_category_image(category_id, file)
    return UploadUrlResponse(data=UploadUrlOut(url=url))


@router.post("/products/images", response_model=UploadUrlResponse)
async def upload_product_image_temp_v2(
    file: Annotated[UploadFile, File()],
    product_id: Annotated[str | None, Query(alias="productId")] = None,
) -> UploadUrlResponse:
    url = await save_product_image(product_id, file)
    return UploadUrlResponse(data=UploadUrlOut(url=url))


@router.post("/products/{product_id}/images", response_model=UploadUrlResponse)
async def upload_product_image_v2(
    product_id: str,
    file: Annotated[UploadFile, File()],
) -> UploadUrlResponse:
    url = await save_product_image(product_id, file)
    return UploadUrlResponse(data=UploadUrlOut(url=url))


@router.post("/portfolio-works/images", response_model=UploadUrlResponse)
async def upload_portfolio_image_temp_v2(
    file: Annotated[UploadFile, File()],
    portfolio_id: Annotated[str | None, Query(alias="portfolioId")] = None,
) -> UploadUrlResponse:
    url = await save_portfolio_image(portfolio_id, file)
    return UploadUrlResponse(data=UploadUrlOut(url=url))


@router.post("/portfolio-works/{portfolio_id}/images", response_model=UploadUrlResponse)
async def upload_portfolio_image_v2(
    portfolio_id: str,
    file: Annotated[UploadFile, File()],
) -> UploadUrlResponse:
    url = await save_portfolio_image(portfolio_id, file)
    return UploadUrlResponse(data=UploadUrlOut(url=url))
