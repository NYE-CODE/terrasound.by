from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.installation import InstallationRequest
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.installation import InstallationRequestOut
from app.schemas.pagination import PaginatedOut, paginated
from app.services.admin_installation_requests import (
    InstallationRequestListFilters,
    count_installation_requests,
    export_installation_requests_csv,
    list_installation_request_services as get_installation_request_services,
    list_installation_requests as fetch_installation_requests,
)

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/installation-requests",
    tags=["admin-installation"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("/services", response_model=list[str])
def list_installation_request_services(
    db: Annotated[Session, Depends(get_db)],
) -> list[str]:
    return get_installation_request_services(db)


@router.get("/export")
def export_installation_requests(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = Query(default=None, max_length=200),
    service: str | None = Query(default=None, max_length=200),
    date_from: str | None = Query(default=None, alias="dateFrom"),
    date_to: str | None = Query(default=None, alias="dateTo"),
) -> Response:
    filters = InstallationRequestListFilters(
        q=q,
        service=service,
        date_from=date_from,
        date_to=date_to,
    )
    content, _count = export_installation_requests_csv(db, filters)
    filename = f"installation-requests-{date.today().isoformat()}.csv"
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", response_model=PaginatedOut[InstallationRequestOut])
def list_installation_requests(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, max_length=200),
    service: str | None = Query(default=None, max_length=200),
    date_from: str | None = Query(default=None, alias="dateFrom"),
    date_to: str | None = Query(default=None, alias="dateTo"),
) -> PaginatedOut[InstallationRequestOut]:
    filters = InstallationRequestListFilters(
        q=q,
        service=service,
        date_from=date_from,
        date_to=date_to,
    )
    total = count_installation_requests(db, filters)
    requests = fetch_installation_requests(db, filters, limit=limit, offset=offset)
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
