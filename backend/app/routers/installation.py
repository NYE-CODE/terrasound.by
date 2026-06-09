import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.installation import InstallationRequest
from app.schemas.installation import InstallationRequestCreate, InstallationRequestOut

router = APIRouter(prefix="/api/installation-requests", tags=["installation"])


@router.post("", response_model=InstallationRequestOut, status_code=201)
def create_installation_request(
    payload: InstallationRequestCreate,
    db: Annotated[Session, Depends(get_db)],
) -> InstallationRequestOut:
    request = InstallationRequest(
        id=str(uuid.uuid4()),
        name=payload.name,
        phone=payload.phone,
        car_model=payload.car_model,
        service=payload.service,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return InstallationRequestOut.model_validate(request)
