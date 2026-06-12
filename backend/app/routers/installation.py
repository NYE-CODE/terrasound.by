import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.cache import CONTENT_SERVICES, content_cache
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.content import InstallationService
from app.models.installation import InstallationRequest
from app.schemas.content import InstallationServiceOut
from app.schemas.installation import InstallationRequestCreate, InstallationRequestOut
from app.schemas.pagination import PaginatedOut, paginated

router = APIRouter(prefix=f"{API_V1_PREFIX}/installation", tags=["installation"])

DEFAULT_LIST_LIMIT = 100
MAX_LIST_LIMIT = 500


@router.get("/services", response_model=PaginatedOut[InstallationServiceOut])
def list_installation_services(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[InstallationServiceOut]:
    def load() -> list[dict]:
        items = (
            db.query(InstallationService)
            .filter(InstallationService.published.is_(True))
            .order_by(InstallationService.sort_order, InstallationService.title)
            .all()
        )
        return [
            InstallationServiceOut.model_validate(item).model_dump(by_alias=True) for item in items
        ]

    cached = content_cache.get(CONTENT_SERVICES, load)
    total = len(cached)
    page = cached[offset : offset + limit]
    data = [InstallationServiceOut.model_validate(item) for item in page]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.post("/requests", response_model=InstallationRequestOut, status_code=201)
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
    commit_or_raise(db)
    db.refresh(request)
    return InstallationRequestOut.model_validate(request)
