import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.products import effective_price


def create_order(db: Session, payload: OrderCreate) -> Order:
    product_ids = [item.product_id for item in payload.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_by_id = {product.id: product for product in products}

    if len(products_by_id) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="Один или несколько товаров не найдены")

    order_items: list[OrderItem] = []
    total = 0.0

    for line in payload.items:
        product = products_by_id[line.product_id]
        if not product.in_stock:
            raise HTTPException(status_code=400, detail="Один или несколько товаров недоступны")

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

    order = Order(
        id=str(uuid.uuid4()),
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
        installation_consultation_requested=payload.installation_consultation_requested,
        payment_method=payload.payment_method,
        total=round(total, 2),
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
