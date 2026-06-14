import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api_constants import ADMIN_V2_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.installation import InstallationRequest
from app.models.order import Order, OrderStatus
from app.models.review import ProductReview, ServiceReview
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.attribute import (
    AttributeCreate,
    AttributeOut,
    AttributeUpdate,
    CategoryAttributeOut,
    CategoryAttributeSchemaOut,
    CategoryAttributeSync,
)
from app.schemas.dashboard import DashboardStatsOut
from app.schemas.installation import InstallationRequestOut
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.pagination import PaginatedOut, paginated
from app.schemas.review import (
    ProductReviewAdminUpdate,
    ProductReviewOut,
    ServiceReviewCreate,
    ServiceReviewOut,
    ServiceReviewUpdate,
)
from app.services.attributes import (
    attribute_to_out,
    create_attribute,
    delete_attribute,
    get_attribute_or_404,
    get_category_form_schema,
    list_attributes,
    list_category_attributes,
    sync_category_attributes,
    update_attribute,
)

dashboard_router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}/dashboard",
    tags=["admin-dashboard"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)
orders_router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}/orders",
    tags=["admin-orders"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)
reviews_router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}",
    tags=["admin-reviews"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)
attributes_router = APIRouter(
    prefix=ADMIN_V2_PREFIX,
    tags=["admin-attributes"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)
installation_requests_router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}/installation-requests",
    tags=["admin-installation"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)

DEFAULT_LIST_LIMIT = 200
MAX_LIST_LIMIT = 500


@dashboard_router.get("", response_model=DashboardStatsOut)
def get_dashboard_stats_v2(db: Annotated[Session, Depends(get_db)]) -> DashboardStatsOut:
    orders_new_sq = (
        select(func.count()).select_from(Order).where(Order.status == OrderStatus.new).scalar_subquery()
    )
    orders_total_sq = select(func.count()).select_from(Order).scalar_subquery()
    reviews_pending_sq = (
        select(func.count())
        .select_from(ProductReview)
        .where(ProductReview.published.is_(False))
        .scalar_subquery()
    )
    installation_requests_sq = select(func.count()).select_from(InstallationRequest).scalar_subquery()
    row = db.execute(
        select(
            orders_new_sq.label("orders_new"),
            orders_total_sq.label("orders_total"),
            reviews_pending_sq.label("reviews_pending"),
            installation_requests_sq.label("installation_requests"),
        )
    ).one()
    return DashboardStatsOut(
        orders_new=row.orders_new or 0,
        orders_total=row.orders_total or 0,
        reviews_pending=row.reviews_pending or 0,
        installation_requests=row.installation_requests or 0,
    )


@orders_router.get("", response_model=PaginatedOut[OrderOut])
def list_orders_v2(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[OrderOut]:
    total = db.query(func.count(Order.id)).scalar() or 0
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return paginated([OrderOut.model_validate(o) for o in orders], total=total, limit=limit, offset=offset)


@orders_router.get("/{order_id}", response_model=OrderOut)
def get_order_v2(order_id: str, db: Annotated[Session, Depends(get_db)]) -> OrderOut:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return OrderOut.model_validate(order)


@orders_router.patch("/{order_id}", response_model=OrderOut)
def update_order_status_v2(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> OrderOut:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    order.status = OrderStatus(payload.status)
    commit_or_raise(db)
    db.refresh(order)
    return OrderOut.model_validate(order)


@orders_router.delete("/{order_id}", status_code=204)
def delete_order_v2(order_id: str, db: Annotated[Session, Depends(get_db)]) -> None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    db.delete(order)
    commit_or_raise(db)


@reviews_router.get("/product-reviews", response_model=PaginatedOut[ProductReviewOut])
def list_product_reviews_admin_v2(
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
    return paginated(
        [ProductReviewOut.model_validate(r) for r in reviews],
        total=total,
        limit=limit,
        offset=offset,
    )


@reviews_router.patch("/product-reviews/{review_id}", response_model=ProductReviewOut)
def update_product_review_admin_v2(
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


@reviews_router.get("/service-reviews", response_model=PaginatedOut[ServiceReviewOut])
def list_service_reviews_admin_v2(
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
    return paginated(
        [ServiceReviewOut.model_validate(r) for r in reviews],
        total=total,
        limit=limit,
        offset=offset,
    )


@reviews_router.post("/service-reviews", response_model=ServiceReviewOut, status_code=201)
def create_service_review_admin_v2(
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


@reviews_router.patch("/service-reviews/{review_id}", response_model=ServiceReviewOut)
def update_service_review_admin_v2(
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


@reviews_router.delete("/service-reviews/{review_id}", status_code=204)
def delete_service_review_admin_v2(review_id: str, db: Annotated[Session, Depends(get_db)]) -> None:
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    commit_or_raise(db)


@attributes_router.get("/attributes", response_model=PaginatedOut[AttributeOut])
def list_attributes_admin_v2(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[AttributeOut]:
    items = list_attributes(db)
    total = len(items)
    page = items[offset : offset + limit]
    return paginated(page, total=total, limit=limit, offset=offset)


@attributes_router.get("/attributes/{attribute_id}", response_model=AttributeOut)
def get_attribute_admin_v2(attribute_id: str, db: Annotated[Session, Depends(get_db)]) -> AttributeOut:
    return attribute_to_out(get_attribute_or_404(db, attribute_id))


@attributes_router.post("/attributes", response_model=AttributeOut, status_code=201)
def create_attribute_admin_v2(
    payload: AttributeCreate,
    db: Annotated[Session, Depends(get_db)],
) -> AttributeOut:
    return attribute_to_out(create_attribute(db, payload))


@attributes_router.patch("/attributes/{attribute_id}", response_model=AttributeOut)
def update_attribute_admin_v2(
    attribute_id: str,
    payload: AttributeUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> AttributeOut:
    return attribute_to_out(update_attribute(db, attribute_id, payload))


@attributes_router.delete("/attributes/{attribute_id}", status_code=204)
def delete_attribute_admin_v2(
    attribute_id: str,
    db: Annotated[Session, Depends(get_db)],
    strategy: Literal["default", "cascade"] = Query("default"),
) -> None:
    delete_attribute(db, attribute_id, strategy=strategy)


@attributes_router.get("/categories/{category_id}/attributes")
def list_category_attributes_admin_v2(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    view: Literal["default", "form"] = Query(default="default"),
) -> list[CategoryAttributeOut] | list[CategoryAttributeSchemaOut]:
    if view == "form":
        return get_category_form_schema(db, category_id)
    return list_category_attributes(db, category_id)


@attributes_router.put("/categories/{category_id}/attributes", response_model=list[CategoryAttributeOut])
def sync_category_attributes_admin_v2(
    category_id: str,
    payload: CategoryAttributeSync,
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryAttributeOut]:
    return sync_category_attributes(db, category_id, payload.items)


@installation_requests_router.get("", response_model=PaginatedOut[InstallationRequestOut])
def list_installation_requests_v2(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[InstallationRequestOut]:
    total = db.query(func.count(InstallationRequest.id)).scalar() or 0
    requests = (
        db.query(InstallationRequest)
        .order_by(InstallationRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return paginated(
        [InstallationRequestOut.model_validate(item) for item in requests],
        total=total,
        limit=limit,
        offset=offset,
    )


@installation_requests_router.delete("/{request_id}", status_code=204)
def delete_installation_request_v2(
    request_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(InstallationRequest).filter(InstallationRequest.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    db.delete(item)
    commit_or_raise(db)
