from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.installation import InstallationRequest
from app.models.order import Order, OrderStatus
from app.models.review import ProductReview
from app.schemas.dashboard import DashboardStatsOut


def get_dashboard_stats(db: Session) -> DashboardStatsOut:
    reviews_pending_sq = (
        select(func.count())
        .select_from(ProductReview)
        .where(ProductReview.published.is_(False))
        .scalar_subquery()
    )

    if not settings.enable_leads_admin_api:
        row = db.execute(select(reviews_pending_sq.label("reviews_pending"))).one()
        return DashboardStatsOut(
            orders_new=0,
            orders_total=0,
            reviews_pending=row.reviews_pending or 0,
            installation_requests=0,
        )

    orders_new_sq = (
        select(func.count())
        .select_from(Order)
        .where(Order.status == OrderStatus.new)
        .scalar_subquery()
    )
    orders_total_sq = select(func.count()).select_from(Order).scalar_subquery()
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
