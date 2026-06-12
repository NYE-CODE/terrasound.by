from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.site_stats import SiteStatsOut
from app.services.site_stats import get_public_site_stats

router = APIRouter(prefix=f"{API_V1_PREFIX}/site-stats", tags=["site-stats"])


@router.get("", response_model=SiteStatsOut)
def get_public_site_stats_route(db: Annotated[Session, Depends(get_db)]) -> SiteStatsOut:
    return get_public_site_stats(db)
