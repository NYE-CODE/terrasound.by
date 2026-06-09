from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models.installation import InstallationRequest
from app.models.order import Order, OrderStatus
from app.models.review import ProductReview
from app.schemas.auth import AdminUser

router = APIRouter(prefix="/api/admin/dashboard", tags=["admin-dashboard"])


@router.get("")
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict:
    return {
        "ordersNew": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.new).scalar() or 0,
        "ordersTotal": db.query(func.count(Order.id)).scalar() or 0,
        "reviewsPending": db.query(func.count(ProductReview.id))
        .filter(ProductReview.published.is_(False))
        .scalar()
        or 0,
        "installationRequests": db.query(func.count(InstallationRequest.id)).scalar() or 0,
    }
