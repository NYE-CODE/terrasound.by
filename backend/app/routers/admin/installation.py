from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models.installation import InstallationRequest
from app.schemas.auth import AdminUser
from app.schemas.installation import InstallationRequestOut

router = APIRouter(prefix="/api/admin/installation-requests", tags=["admin-installation"])


@router.get("", response_model=list[InstallationRequestOut])
def list_installation_requests(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[InstallationRequestOut]:
    requests = (
        db.query(InstallationRequest)
        .order_by(InstallationRequest.created_at.desc())
        .all()
    )
    return [InstallationRequestOut.model_validate(item) for item in requests]
