from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import API_V2_PREFIX
from app.database import get_db
from app.schemas.order import OrderCreate, OrderCreatedOut
from app.services.orders import submit_order_by_email

router = APIRouter(prefix=f"{API_V2_PREFIX}/orders", tags=["orders"])


@router.post("", response_model=OrderCreatedOut, status_code=201)
def submit_order_v2(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
) -> OrderCreatedOut:
    order = submit_order_by_email(db, payload)
    return OrderCreatedOut.model_validate(order)
