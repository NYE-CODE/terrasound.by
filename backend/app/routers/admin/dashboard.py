from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.models.installation import InstallationRequest
from app.models.order import Order, OrderStatus
from app.models.review import ProductReview
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.dashboard import DashboardStatsOut

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/dashboard",
    tags=["admin-dashboard"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
) -> DashboardStatsOut:
    orders_new_sq = (
        select(func.count())
        .select_from(Order)
        .where(Order.status == OrderStatus.new)
        .scalar_subquery()
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
