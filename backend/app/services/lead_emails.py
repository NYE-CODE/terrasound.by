"""Письма по заказам и заявкам на установку (клиент + администратор)."""

from __future__ import annotations

from datetime import datetime
from html import escape

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.models.order import Order
from app.schemas.installation import InstallationRequestCreate
from app.services.email_sender import EmailDeliveryError, send_message
from app.services.site_contact import get_or_create_site_contact

PAYMENT_METHOD_LABELS: dict[str, str] = {
    "cash": "Наличные при получении",
    "card": "Оплата картой",
    "bank": "Безналичный расчёт для юрлиц",
}

SITE_NAME = "Территория звука"
CLIENT_SIGN_OFF_TEXT = 'С уважением,\nкоманда "Территория звука"'
PREORDER_LABEL = "Под заказ"
PREORDER_USER_NOTE = (
    "В заказе есть товары под заказ. Сроки поставки мы согласуем с вами отдельно."
)
PREORDER_ADMIN_NOTE = (
    "В заказе есть позиции под заказ — потребуется заказ у поставщика."
)


def _admin_recipient(db: Session) -> str:
    if settings.notification_email:
        return settings.notification_email.strip()
    return get_or_create_site_contact(db).email.strip()


def _format_car(order: Order) -> str:
    parts = [part for part in (order.car_make, order.car_model, order.car_year) if part]
    return " ".join(parts) if parts else "—"


def _item_availability_label(item) -> str:
    return "В наличии" if getattr(item, "in_stock", True) else PREORDER_LABEL


def _order_has_preorder_items(order: Order) -> bool:
    return any(not getattr(item, "in_stock", True) for item in order.items)


def _format_order_items_text(order: Order) -> str:
    lines = []
    for item in order.items:
        availability = _item_availability_label(item)
        lines.append(
            f"- {item.product_brand} {item.product_name} × {item.quantity} "
            f"({item.unit_price:.2f} BYN) — {availability}"
        )
    return "\n".join(lines)


def _format_order_items_html(order: Order) -> str:
    rows = []
    for item in order.items:
        rows.append(
            "<tr>"
            f"<td>{escape(item.product_brand)} {escape(item.product_name)}</td>"
            f"<td>{item.quantity}</td>"
            f"<td>{item.unit_price:.2f} BYN</td>"
            f"<td>{escape(_item_availability_label(item))}</td>"
            "</tr>"
        )
    return (
        "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse'>"
        "<thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Наличие</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table>"
    )


def _preorder_user_text_block() -> str:
    return f"\n{PREORDER_USER_NOTE}\n"


def _preorder_user_html_block() -> str:
    return f"<p><strong>{escape(PREORDER_USER_NOTE)}</strong></p>"


def _preorder_admin_text_block(order: Order) -> str:
    lines = [PREORDER_ADMIN_NOTE, "Позиции под заказ:"]
    for item in order.items:
        if getattr(item, "in_stock", True):
            continue
        lines.append(f"- {item.product_brand} {item.product_name} × {item.quantity}")
    return "\n".join(lines) + "\n\n"


def _preorder_admin_html_block(order: Order) -> str:
    rows = []
    for item in order.items:
        if getattr(item, "in_stock", True):
            continue
        rows.append(
            "<li>"
            f"{escape(item.product_brand)} {escape(item.product_name)} × {item.quantity}"
            "</li>"
        )
    if not rows:
        return ""
    return (
        f"<p><strong>{escape(PREORDER_ADMIN_NOTE)}</strong></p>"
        f"<ul>{''.join(rows)}</ul>"
    )


def _client_sign_off_html() -> str:
    return '<p style="margin-top:24px">С уважением,<br>команда "Территория звука"</p>'


def _wrap_html(body: str) -> str:
    return (
        "<!DOCTYPE html><html><body style='font-family:sans-serif;color:#222;line-height:1.5'>"
        f"{body}"
        "</body></html>"
    )


def _raise_delivery_error(message: str, exc: EmailDeliveryError) -> None:
    raise HTTPException(status_code=503, detail=message) from exc


def send_order_emails(db: Session, order: Order) -> None:
    payment = PAYMENT_METHOD_LABELS.get(order.payment_method, order.payment_method)
    car = _format_car(order)
    items_text = _format_order_items_text(order)
    items_html = _format_order_items_html(order)
    order_ref = order.id[:8].upper()
    has_preorder = _order_has_preorder_items(order)

    user_subject = f"Заявка на заказ №{order_ref} принята — {SITE_NAME}"
    user_text = (
        f"Здравствуйте, {order.name}!\n\n"
        f"Мы получили вашу заявку на заказ №{order_ref}.\n"
        f"Менеджер свяжется с вами в ближайшее время.\n\n"
        f"Сумма: {order.total:.2f} BYN\n"
        f"Способ оплаты: {payment}\n\n"
        f"Состав заказа:\n{items_text}\n"
    )
    if has_preorder:
        user_text += _preorder_user_text_block()
    user_text += (
        f"\nКонтакты для связи:\n"
        f"Телефон: {order.phone}\n"
        f"Email: {order.email}\n"
        f"Адрес: {order.city}, {order.address}\n"
        f"Автомобиль: {car}\n"
    )
    if order.car_comment:
        user_text += f"Комментарий к авто: {order.car_comment}\n"
    user_text += f"\n{CLIENT_SIGN_OFF_TEXT}"

    user_html = _wrap_html(
        f"<p>Здравствуйте, <strong>{escape(order.name)}</strong>!</p>"
        f"<p>Мы получили вашу заявку на заказ <strong>№{order_ref}</strong>. "
        "Менеджер свяжется с вами в ближайшее время.</p>"
        f"<p><strong>Сумма:</strong> {order.total:.2f} BYN<br>"
        f"<strong>Способ оплаты:</strong> {escape(payment)}</p>"
        f"<h3>Состав заказа</h3>{items_html}"
        + (_preorder_user_html_block() if has_preorder else "")
        + f"<p><strong>Телефон:</strong> {escape(order.phone)}<br>"
        f"<strong>Email:</strong> {escape(order.email)}<br>"
        f"<strong>Адрес:</strong> {escape(order.city)}, {escape(order.address)}<br>"
        f"<strong>Автомобиль:</strong> {escape(car)}</p>"
        + (
            f"<p><strong>Комментарий:</strong> {escape(order.car_comment)}</p>"
            if order.car_comment
            else ""
        )
        + _client_sign_off_html()
    )

    admin_subject = f"Новая заявка на заказ №{order_ref} — {order.name}"
    admin_text = (
        f"Новая заявка на заказ №{order_ref}\n"
        f"Дата: {order.created_at.strftime('%d.%m.%Y %H:%M')}\n\n"
        f"Клиент: {order.name}\n"
        f"Телефон: {order.phone}\n"
        f"Email: {order.email}\n"
        f"Город: {order.city}\n"
        f"Адрес: {order.address}\n"
        f"Автомобиль: {car}\n"
    )
    if order.car_comment:
        admin_text += f"Комментарий к авто: {order.car_comment}\n"
    admin_text += (
        f"\nОплата: {payment}\n"
        f"Сумма: {order.total:.2f} BYN\n\n"
        f"Товары:\n{items_text}\n"
    )
    if has_preorder:
        admin_text += _preorder_admin_text_block(order)

    admin_html = _wrap_html(
        f"<h2>Новая заявка на заказ №{order_ref}</h2>"
        f"<p><strong>Дата:</strong> {order.created_at.strftime('%d.%m.%Y %H:%M')}</p>"
        f"<p><strong>Клиент:</strong> {escape(order.name)}<br>"
        f"<strong>Телефон:</strong> {escape(order.phone)}<br>"
        f"<strong>Email:</strong> {escape(order.email)}<br>"
        f"<strong>Адрес:</strong> {escape(order.city)}, {escape(order.address)}<br>"
        f"<strong>Автомобиль:</strong> {escape(car)}</p>"
        + (
            f"<p><strong>Комментарий:</strong> {escape(order.car_comment)}</p>"
            if order.car_comment
            else ""
        )
        + f"<p><strong>Оплата:</strong> {escape(payment)}<br>"
        f"<strong>Сумма:</strong> {order.total:.2f} BYN</p>"
        f"<h3>Товары</h3>{items_html}"
        + (_preorder_admin_html_block(order) if has_preorder else "")
    )

    admin_to = _admin_recipient(db)
    try:
        send_message(to=order.email, subject=user_subject, text_body=user_text, html_body=user_html)
        send_message(to=admin_to, subject=admin_subject, text_body=admin_text, html_body=admin_html)
    except EmailDeliveryError as exc:
        _raise_delivery_error(
            "Не удалось отправить уведомление на почту. Попробуйте позже или позвоните нам.",
            exc,
        )


def send_installation_request_emails(
    db: Session,
    *,
    request_id: str,
    payload: InstallationRequestCreate,
    created_at: datetime,
) -> None:
    request_ref = request_id[:8].upper()
    user_email = str(payload.email).strip()

    user_subject = f"Заявка на установку №{request_ref} принята — {SITE_NAME}"
    user_text = (
        f"Здравствуйте, {payload.name}!\n\n"
        f"Мы получили вашу заявку на установку №{request_ref}.\n"
        f"Менеджер свяжется с вами в ближайшее время.\n\n"
        f"Услуга: {payload.service}\n"
        f"Автомобиль: {payload.car_model}\n"
        f"Телефон: {payload.phone}\n\n"
        f"{CLIENT_SIGN_OFF_TEXT}"
    )
    user_html = _wrap_html(
        f"<p>Здравствуйте, <strong>{escape(payload.name)}</strong>!</p>"
        f"<p>Мы получили вашу заявку на установку <strong>№{request_ref}</strong>. "
        "Менеджер свяжется с вами в ближайшее время.</p>"
        f"<p><strong>Услуга:</strong> {escape(payload.service)}<br>"
        f"<strong>Автомобиль:</strong> {escape(payload.car_model)}<br>"
        f"<strong>Телефон:</strong> {escape(payload.phone)}</p>"
        + _client_sign_off_html()
    )

    admin_subject = f"Новая заявка на установку №{request_ref} — {payload.name}"
    admin_text = (
        f"Новая заявка на установку №{request_ref}\n"
        f"Дата: {created_at.strftime('%d.%m.%Y %H:%M')}\n\n"
        f"Имя: {payload.name}\n"
        f"Телефон: {payload.phone}\n"
        f"Email: {user_email}\n"
        f"Автомобиль: {payload.car_model}\n"
        f"Услуга: {payload.service}\n"
    )
    admin_html = _wrap_html(
        f"<h2>Новая заявка на установку №{request_ref}</h2>"
        f"<p><strong>Дата:</strong> {created_at.strftime('%d.%m.%Y %H:%M')}</p>"
        f"<p><strong>Имя:</strong> {escape(payload.name)}<br>"
        f"<strong>Телефон:</strong> {escape(payload.phone)}<br>"
        f"<strong>Email:</strong> {escape(user_email)}<br>"
        f"<strong>Автомобиль:</strong> {escape(payload.car_model)}<br>"
        f"<strong>Услуга:</strong> {escape(payload.service)}</p>"
    )

    admin_to = _admin_recipient(db)
    try:
        send_message(to=user_email, subject=user_subject, text_body=user_text, html_body=user_html)
        send_message(to=admin_to, subject=admin_subject, text_body=admin_text, html_body=admin_html)
    except EmailDeliveryError as exc:
        _raise_delivery_error(
            "Не удалось отправить заявку. Попробуйте позже или позвоните нам.",
            exc,
        )
