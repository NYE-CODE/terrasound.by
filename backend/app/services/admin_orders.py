import csv
import io
from dataclasses import dataclass

from sqlalchemy import or_
from sqlalchemy.orm import Query, Session, joinedload

from app.models.order import Order, OrderStatus
from app.services.admin_list_filters import (
    apply_created_at_range,
    normalize_search_query,
    parse_filter_date_from,
    parse_filter_date_to,
)

MAX_EXPORT_ROWS = 10_000

ORDER_STATUS_LABELS: dict[OrderStatus, str] = {
    OrderStatus.new: "Новый",
    OrderStatus.confirmed: "Подтверждён",
    OrderStatus.completed: "Выполнен",
    OrderStatus.cancelled: "Отменён",
}

PAYMENT_METHOD_LABELS: dict[str, str] = {
    "cash": "Наличные",
    "card": "Карта",
    "bank": "Безналичный расчёт",
}


@dataclass(frozen=True)
class OrderListFilters:
    q: str | None = None
    status: OrderStatus | None = None
    payment_method: str | None = None
    date_from: str | None = None
    date_to: str | None = None


def _build_orders_query(db: Session, filters: OrderListFilters) -> Query[Order]:
    query = db.query(Order)

    search = normalize_search_query(filters.q)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Order.id.ilike(pattern),
                Order.name.ilike(pattern),
                Order.phone.ilike(pattern),
                Order.email.ilike(pattern),
                Order.city.ilike(pattern),
            )
        )

    if filters.status is not None:
        query = query.filter(Order.status == filters.status)

    if filters.payment_method:
        query = query.filter(Order.payment_method == filters.payment_method)

    query = apply_created_at_range(
        query,
        column=Order.created_at,
        date_from=parse_filter_date_from(filters.date_from),
        date_to=parse_filter_date_to(filters.date_to),
    )

    return query.order_by(Order.created_at.desc())


def count_orders(db: Session, filters: OrderListFilters) -> int:
    return _build_orders_query(db, filters).count()


def list_orders(
    db: Session,
    filters: OrderListFilters,
    *,
    limit: int,
    offset: int,
) -> list[Order]:
    return (
        _build_orders_query(db, filters)
        .options(joinedload(Order.items))
        .offset(offset)
        .limit(limit)
        .all()
    )


def _format_order_items(order: Order) -> str:
    parts = [
        f"{item.product_brand} {item.product_name} × {item.quantity} ({item.unit_price:.2f} BYN)"
        for item in order.items
    ]
    return "; ".join(parts)


def _format_car(order: Order) -> str:
    parts = [part for part in (order.car_make, order.car_model, order.car_year) if part]
    return " ".join(parts)


def export_orders_csv(db: Session, filters: OrderListFilters) -> tuple[bytes, int]:
    orders = (
        _build_orders_query(db, filters)
        .options(joinedload(Order.items))
        .limit(MAX_EXPORT_ROWS)
        .all()
    )

    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(
        [
            "ID",
            "Дата",
            "Статус",
            "Имя",
            "Телефон",
            "Email",
            "Город",
            "Адрес",
            "Автомобиль",
            "Комментарий к авто",
            "Оплата",
            "Сумма (BYN)",
            "Товары",
        ]
    )

    for order in orders:
        writer.writerow(
            [
                order.id,
                order.created_at.isoformat(sep=" ", timespec="seconds"),
                ORDER_STATUS_LABELS.get(order.status, order.status.value),
                order.name,
                order.phone,
                order.email,
                order.city,
                order.address,
                _format_car(order),
                order.car_comment or "",
                PAYMENT_METHOD_LABELS.get(order.payment_method, order.payment_method),
                f"{order.total:.2f}",
                _format_order_items(order),
            ]
        )

    return buffer.getvalue().encode("utf-8"), len(orders)
