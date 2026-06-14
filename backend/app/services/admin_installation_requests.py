import csv
import io
from dataclasses import dataclass

from sqlalchemy.orm import Query, Session

from app.models.installation import InstallationRequest
from app.services.admin_list_filters import (
    apply_created_at_range,
    normalize_search_query,
    parse_filter_date_from,
    parse_filter_date_to,
)

MAX_EXPORT_ROWS = 10_000


@dataclass(frozen=True)
class InstallationRequestListFilters:
    q: str | None = None
    service: str | None = None
    date_from: str | None = None
    date_to: str | None = None


def _build_installation_requests_query(
    db: Session,
    filters: InstallationRequestListFilters,
) -> Query[InstallationRequest]:
    query = db.query(InstallationRequest)

    search = normalize_search_query(filters.q)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                InstallationRequest.name.ilike(pattern),
                InstallationRequest.phone.ilike(pattern),
                InstallationRequest.car_model.ilike(pattern),
                InstallationRequest.service.ilike(pattern),
            )
        )

    if filters.service:
        query = query.filter(InstallationRequest.service == filters.service)

    query = apply_created_at_range(
        query,
        column=InstallationRequest.created_at,
        date_from=parse_filter_date_from(filters.date_from),
        date_to=parse_filter_date_to(filters.date_to),
    )

    return query.order_by(InstallationRequest.created_at.desc())


def count_installation_requests(db: Session, filters: InstallationRequestListFilters) -> int:
    return _build_installation_requests_query(db, filters).count()


def list_installation_requests(
    db: Session,
    filters: InstallationRequestListFilters,
    *,
    limit: int,
    offset: int,
) -> list[InstallationRequest]:
    return (
        _build_installation_requests_query(db, filters)
        .offset(offset)
        .limit(limit)
        .all()
    )


def list_installation_request_services(db: Session) -> list[str]:
    rows = (
        db.query(InstallationRequest.service)
        .distinct()
        .order_by(InstallationRequest.service.asc())
        .all()
    )
    return [row[0] for row in rows if row[0]]


def export_installation_requests_csv(
    db: Session,
    filters: InstallationRequestListFilters,
) -> tuple[bytes, int]:
    requests = _build_installation_requests_query(db, filters).limit(MAX_EXPORT_ROWS).all()

    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(["ID", "Дата", "Имя", "Телефон", "Автомобиль", "Услуга"])

    for item in requests:
        writer.writerow(
            [
                item.id,
                item.created_at.isoformat(sep=" ", timespec="seconds"),
                item.name,
                item.phone,
                item.car_model,
                item.service,
            ]
        )

    return buffer.getvalue().encode("utf-8"), len(requests)
