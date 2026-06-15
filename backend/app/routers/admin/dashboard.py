from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.dashboard import DashboardStatsOut
from app.services.dashboard_stats import get_dashboard_stats as fetch_dashboard_stats

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/dashboard",
    tags=["admin-dashboard"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
) -> DashboardStatsOut:
    return fetch_dashboard_stats(db)
