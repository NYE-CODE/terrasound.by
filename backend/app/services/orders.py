import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.lead_emails import send_order_emails
from app.services.products import effective_price


def build_order(db: Session, payload: OrderCreate) -> Order:
    product_ids = [item.product_id for item in payload.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_by_id = {product.id: product for product in products}

    if len(products_by_id) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="Один или несколько товаров не найдены")

    order_items: list[OrderItem] = []
    total = 0.0

    for line in payload.items:
        product = products_by_id[line.product_id]

        unit_price = effective_price(product)
        line_total = unit_price * line.quantity
        total += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_brand=product.brand,
                product_name=product.name,
                unit_price=unit_price,
                quantity=line.quantity,
            )
        )

    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        status=OrderStatus.new,
        name=payload.contact.name,
        phone=payload.contact.phone,
        email=payload.contact.email,
        city=payload.contact.city,
        address=payload.contact.address,
        car_make=payload.car.make,
        car_model=payload.car.model,
        car_year=payload.car.year,
        car_comment=payload.car.comment,
        payment_method=payload.payment_method,
        total=round(total, 2),
        created_at=datetime.utcnow(),
        items=order_items,
    )
    for item in order_items:
        item.order_id = order_id
    return order


def submit_order_by_email(db: Session, payload: OrderCreate) -> Order:
    order = build_order(db, payload)
    send_order_emails(db, order)
    return order
