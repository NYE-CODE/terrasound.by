import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.review import ProductReview, ServiceReview
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.pagination import PaginatedOut, paginated
from app.schemas.review import (
    ProductReviewAdminUpdate,
    ProductReviewOut,
    ServiceReviewCreate,
    ServiceReviewOut,
    ServiceReviewUpdate,
)

router = APIRouter(prefix=f"{ADMIN_V1_PREFIX}", tags=["admin-reviews"], dependencies=ADMIN_ROUTER_DEPENDENCIES)


@router.get("/product-reviews", response_model=PaginatedOut[ProductReviewOut])
def list_product_reviews_admin(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ProductReviewOut]:
    total = db.query(func.count(ProductReview.id)).scalar() or 0
    reviews = (
        db.query(ProductReview)
        .order_by(ProductReview.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    data = [ProductReviewOut.model_validate(review) for review in reviews]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.patch("/product-reviews/{review_id}", response_model=ProductReviewOut)
def update_product_review_admin(
    review_id: str,
    payload: ProductReviewAdminUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductReviewOut:
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    review.published = payload.published
    commit_or_raise(db)
    db.refresh(review)
    return ProductReviewOut.model_validate(review)


@router.get("/service-reviews", response_model=PaginatedOut[ServiceReviewOut])
def list_service_reviews_admin(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[ServiceReviewOut]:
    total = db.query(func.count(ServiceReview.id)).scalar() or 0
    reviews = (
        db.query(ServiceReview)
        .order_by(ServiceReview.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    data = [ServiceReviewOut.model_validate(review) for review in reviews]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.post("/service-reviews", response_model=ServiceReviewOut, status_code=201)
def create_service_review_admin(
    payload: ServiceReviewCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ServiceReviewOut:
    review = ServiceReview(
        id=str(uuid.uuid4()),
        author=payload.author,
        car=payload.car,
        rating=payload.rating,
        text=payload.text,
        published=payload.published,
    )
    db.add(review)
    commit_or_raise(db)
    db.refresh(review)
    return ServiceReviewOut.model_validate(review)


@router.patch("/service-reviews/{review_id}", response_model=ServiceReviewOut)
def update_service_review_admin(
    review_id: str,
    payload: ServiceReviewUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ServiceReviewOut:
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    commit_or_raise(db)
    db.refresh(review)
    return ServiceReviewOut.model_validate(review)


@router.delete("/service-reviews/{review_id}", status_code=204)
def delete_service_review_admin(
    review_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    commit_or_raise(db)
