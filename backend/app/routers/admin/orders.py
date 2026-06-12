from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.db_commit import commit_or_raise
from app.models.order import Order, OrderStatus
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.pagination import PaginatedOut, paginated

router = APIRouter(
    prefix=f"{ADMIN_V1_PREFIX}/orders",
    tags=["admin-orders"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("", response_model=PaginatedOut[OrderOut])
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[OrderOut]:
    total = db.query(func.count(Order.id)).scalar() or 0
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
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
