from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.site_announcement import SiteAnnouncementOut, SiteAnnouncementUpdate
from app.services.site_announcement import (
    get_or_create_site_announcement,
    site_announcement_to_out,
    update_site_announcement,
)

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/site-announcement",
    tags=["admin-site-announcement"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=SiteAnnouncementOut)
def get_admin_site_announcement(
    db: Annotated[Session, Depends(get_db)],
) -> SiteAnnouncementOut:
    return site_announcement_to_out(get_or_create_site_announcement(db))


@router.patch("", response_model=SiteAnnouncementOut)
def patch_site_announcement(
    payload: SiteAnnouncementUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteAnnouncementOut:
    return site_announcement_to_out(update_site_announcement(db, payload))
