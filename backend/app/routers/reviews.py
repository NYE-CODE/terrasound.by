import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import ProductReview, ServiceReview
from app.schemas.review import (
    ProductReviewCreate,
    ProductReviewCreatedOut,
    ProductReviewPublicOut,
    ServiceReviewOut,
)
from app.services.products import get_product_or_404

router = APIRouter(prefix="/api", tags=["reviews"])


def _review_to_public(review: ProductReview) -> ProductReviewPublicOut:
    return ProductReviewPublicOut.model_validate(review)


def _review_to_created(review: ProductReview) -> ProductReviewCreatedOut:
    return ProductReviewCreatedOut.model_validate(review)


@router.get("/reviews/service", response_model=list[ServiceReviewOut])
def list_service_reviews(db: Annotated[Session, Depends(get_db)]) -> list[ServiceReviewOut]:
    reviews = (
        db.query(ServiceReview)
        .filter(ServiceReview.published.is_(True))
        .order_by(ServiceReview.created_at.desc())
        .all()
    )
    return [ServiceReviewOut.model_validate(review) for review in reviews]


@router.get("/products/{product_id}/reviews", response_model=list[ProductReviewPublicOut])
def list_product_reviews(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> list[ProductReviewPublicOut]:
    get_product_or_404(db, product_id)
    reviews = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.published.is_(True))
        .order_by(ProductReview.created_at.desc())
        .all()
    )
    return [_review_to_public(review) for review in reviews]


@router.post(
    "/products/{product_id}/reviews",
    response_model=ProductReviewCreatedOut,
    status_code=201,
)
def create_product_review(
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
    db.commit()
    db.refresh(review)
    return _review_to_created(review)
