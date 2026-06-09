import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models.review import ProductReview, ServiceReview
from app.schemas.auth import AdminUser
from app.schemas.review import (
    ProductReviewAdminUpdate,
    ProductReviewOut,
    ServiceReviewCreate,
    ServiceReviewOut,
    ServiceReviewUpdate,
)

router = APIRouter(prefix="/api/admin/reviews", tags=["admin-reviews"])


@router.get("/product", response_model=list[ProductReviewOut])
def list_product_reviews_admin(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[ProductReviewOut]:
    reviews = db.query(ProductReview).order_by(ProductReview.created_at.desc()).all()
    return [ProductReviewOut.model_validate(review) for review in reviews]


@router.patch("/product/{review_id}", response_model=ProductReviewOut)
def update_product_review_admin(
    review_id: str,
    payload: ProductReviewAdminUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> ProductReviewOut:
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    review.published = payload.published
    db.commit()
    db.refresh(review)
    return ProductReviewOut.model_validate(review)


@router.get("/service", response_model=list[ServiceReviewOut])
def list_service_reviews_admin(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[ServiceReviewOut]:
    reviews = db.query(ServiceReview).order_by(ServiceReview.created_at.desc()).all()
    return [ServiceReviewOut.model_validate(review) for review in reviews]


@router.post("/service", response_model=ServiceReviewOut, status_code=201)
def create_service_review_admin(
    payload: ServiceReviewCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
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
    db.commit()
    db.refresh(review)
    return ServiceReviewOut.model_validate(review)


@router.patch("/service/{review_id}", response_model=ServiceReviewOut)
def update_service_review_admin(
    review_id: str,
    payload: ServiceReviewUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> ServiceReviewOut:
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)
    return ServiceReviewOut.model_validate(review)


@router.delete("/service/{review_id}", status_code=204)
def delete_service_review_admin(
    review_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> None:
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    db.commit()
