from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.order import Order, OrderStatus
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.pagination import PaginatedOut, paginated
from app.services.admin_orders import (
    OrderListFilters,
    count_orders,
    export_orders_csv,
    list_orders as fetch_orders,
)

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/orders",
    tags=["admin-orders"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)

PaymentMethodFilter = Literal["cash", "card", "bank"]


def _parse_order_status(value: str | None) -> OrderStatus | None:
    if not value:
        return None
    try:
        return OrderStatus(value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Некорректный статус заказа") from exc


@router.get("/export")
def export_orders(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = Query(default=None, max_length=200),
    status: str | None = Query(default=None),
    payment_method: PaymentMethodFilter | None = Query(default=None, alias="paymentMethod"),
    date_from: str | None = Query(default=None, alias="dateFrom"),
    date_to: str | None = Query(default=None, alias="dateTo"),
) -> Response:
    filters = OrderListFilters(
        q=q,
        status=_parse_order_status(status),
        payment_method=payment_method,
        date_from=date_from,
        date_to=date_to,
    )
    content, _count = export_orders_csv(db, filters)
    filename = f"orders-{date.today().isoformat()}.csv"
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", response_model=PaginatedOut[OrderOut])
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, max_length=200),
    status: str | None = Query(default=None),
    payment_method: PaymentMethodFilter | None = Query(default=None, alias="paymentMethod"),
    date_from: str | None = Query(default=None, alias="dateFrom"),
    date_to: str | None = Query(default=None, alias="dateTo"),
) -> PaginatedOut[OrderOut]:
    filters = OrderListFilters(
        q=q,
        status=_parse_order_status(status),
        payment_method=payment_method,
        date_from=date_from,
        date_to=date_to,
    )
    total = count_orders(db, filters)
    orders = fetch_orders(db, filters, limit=limit, offset=offset)
    data = [OrderOut.model_validate(order) for order in orders]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> OrderOut:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return OrderOut.model_validate(order)


@router.patch("/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> OrderOut:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    order.status = OrderStatus(payload.status)
    commit_or_raise(db)
    db.refresh(order)
    return OrderOut.model_validate(order)


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    db.delete(order)
    commit_or_raise(db)
