import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api_constants import API_V2_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.review import ProductReview, ServiceReview
from app.schemas.pagination import PaginatedOut, paginated
from app.schemas.review import (
    ProductReviewCreate,
    ProductReviewCreatedOut,
    ProductReviewPublicOut,
    ServiceReviewOut,
)
from app.services.products import get_product_or_404

router = APIRouter(prefix=API_V2_PREFIX, tags=["reviews"])

DEFAULT_REVIEW_LIMIT = 50
MAX_REVIEW_LIMIT = 100


@router.get("/service-reviews", response_model=PaginatedOut[ServiceReviewOut])
def list_service_reviews_v2(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_REVIEW_LIMIT, ge=1, le=MAX_REVIEW_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ServiceReviewOut]:
    query = (
        db.query(ServiceReview)
        .filter(ServiceReview.published.is_(True))
        .order_by(ServiceReview.created_at.desc())
    )
    total = query.order_by(None).count()
    reviews = query.offset(offset).limit(limit).all()
    data = [ServiceReviewOut.model_validate(review) for review in reviews]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/products/{product_id}/reviews", response_model=PaginatedOut[ProductReviewPublicOut])
def list_product_reviews_v2(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_REVIEW_LIMIT, ge=1, le=MAX_REVIEW_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ProductReviewPublicOut]:
    get_product_or_404(db, product_id)
    query = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.published.is_(True))
        .order_by(ProductReview.created_at.desc())
    )
    total = query.order_by(None).count()
    reviews = query.offset(offset).limit(limit).all()
    data = [ProductReviewPublicOut.model_validate(review) for review in reviews]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.post(
    "/products/{product_id}/reviews",
    response_model=ProductReviewCreatedOut,
    status_code=201,
)
def create_product_review_v2(
    product_id: str,
    payload: ProductReviewCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductReviewCreatedOut:
    get_product_or_404(db, product_id)
    review = ProductReview(
        id=str(uuid.uuid4()),
        product_id=product_id,
        author=payload.author,
        email=payload.email,
        text=payload.text,
        rating=payload.rating,
        published=False,
    )
    db.add(review)
    commit_or_raise(db)
    db.refresh(review)
    return ProductReviewCreatedOut.model_validate(review)
