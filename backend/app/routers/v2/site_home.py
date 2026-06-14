from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V2_PREFIX
from app.database import get_db
from app.schemas.site_home import SiteHomeOut
from app.services.site_home import get_site_home

router = APIRouter(prefix=f"{API_V2_PREFIX}/site", tags=["site"])


@router.get("/home", response_model=SiteHomeOut)
def get_site_home_v2(db: Annotated[Session, Depends(get_db)]) -> SiteHomeOut:
    return get_site_home(db)
