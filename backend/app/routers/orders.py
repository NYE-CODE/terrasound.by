from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.services.orders import create_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def submit_order(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
) -> OrderOut:
    order = create_order(db, payload)
    return OrderOut.model_validate(order)
