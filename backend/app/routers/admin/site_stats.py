from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.site_stats import SiteStatsOut, SiteStatsUpdate
from app.services.site_stats import get_or_create_site_stats, site_stats_to_out, update_site_stats

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/site-stats",
    tags=["admin-site-stats"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=SiteStatsOut)
def get_admin_site_stats(
    db: Annotated[Session, Depends(get_db)],
) -> SiteStatsOut:
    return site_stats_to_out(get_or_create_site_stats(db))


@router.patch("", response_model=SiteStatsOut)
def patch_site_stats(
    payload: SiteStatsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteStatsOut:
    return site_stats_to_out(update_site_stats(db, payload))
