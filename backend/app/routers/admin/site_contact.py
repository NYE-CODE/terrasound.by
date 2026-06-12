from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.site_contact import SiteContactOut, SiteContactUpdate
from app.services.site_contact import (
    get_or_create_site_contact,
    site_contact_to_out,
    update_site_contact,
)

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/site-contact",
    tags=["admin-site-contact"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=SiteContactOut)
def get_admin_site_contact(
    db: Annotated[Session, Depends(get_db)],
) -> SiteContactOut:
    return site_contact_to_out(get_or_create_site_contact(db))


@router.patch("", response_model=SiteContactOut)
def patch_site_contact(
    payload: SiteContactUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteContactOut:
    return site_contact_to_out(update_site_contact(db, payload))
