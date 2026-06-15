import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.schemas.installation import InstallationRequestCreate, InstallationRequestOut
from app.services.lead_emails import send_installation_request_emails


def submit_installation_request_by_email(
    db: Session,
    payload: InstallationRequestCreate,
) -> InstallationRequestOut:
    request_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    send_installation_request_emails(
        db,
        request_id=request_id,
        payload=payload,
        created_at=created_at,
    )
    return InstallationRequestOut(
        id=request_id,
        name=payload.name,
        phone=payload.phone,
        email=str(payload.email),
        car_model=payload.car_model,
        service=payload.service,
        created_at=created_at,
    )
