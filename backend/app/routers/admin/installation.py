from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.installation import InstallationRequest
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.installation import InstallationRequestOut
from app.schemas.pagination import PaginatedOut, paginated

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/installation-requests",
    tags=["admin-installation"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=PaginatedOut[InstallationRequestOut])
def list_installation_requests(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[InstallationRequestOut]:
    total = db.query(func.count(InstallationRequest.id)).scalar() or 0
    requests = (
        db.query(InstallationRequest)
        .order_by(InstallationRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    data = [InstallationRequestOut.model_validate(item) for item in requests]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.delete("/{request_id}", status_code=204)
def delete_installation_request(
    request_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(InstallationRequest).filter(InstallationRequest.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    db.delete(item)
    commit_or_raise(db)
