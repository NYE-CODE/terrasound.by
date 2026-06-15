from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V1_PREFIX
from app.database import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.services.orders import submit_order_by_email

router = APIRouter(prefix=f"{API_V1_PREFIX}/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def submit_order(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
) -> OrderOut:
    """Создание заказа с витрины."""
    order = submit_order_by_email(db, payload)
    return OrderOut.model_validate(order)
