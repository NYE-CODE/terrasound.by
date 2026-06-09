from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_admin
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.schemas.auth import AdminUser
from app.schemas.order import OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[OrderOut]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(order) for order in orders]


@router.patch("/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
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
    db.commit()
    db.refresh(order)
    return OrderOut.model_validate(order)
