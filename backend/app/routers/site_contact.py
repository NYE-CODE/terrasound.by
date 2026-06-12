from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.site_contact import SiteContactOut
from app.services.site_contact import get_public_site_contact

router = APIRouter(prefix=f"{API_V1_PREFIX}/site-contact", tags=["site-contact"])


@router.get("", response_model=SiteContactOut)
def get_public_site_contact_route(db: Annotated[Session, Depends(get_db)]) -> SiteContactOut:
    return get_public_site_contact(db)
