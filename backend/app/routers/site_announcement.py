from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.site_announcement import SiteAnnouncementOut
from app.services.site_announcement import get_public_site_announcement

router = APIRouter(prefix=f"{API_V1_PREFIX}/site-announcement", tags=["site-announcement"])


@router.get("", response_model=SiteAnnouncementOut)
def get_public_site_announcement_route(
    db: Annotated[Session, Depends(get_db)],
) -> SiteAnnouncementOut:
    return get_public_site_announcement(db)
