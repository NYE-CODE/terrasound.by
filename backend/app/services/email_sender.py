"""Отправка писем через SMTP (stdlib)."""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    """Не удалось доставить письмо."""


def send_message(*, to: str, subject: str, text_body: str, html_body: str) -> None:
    recipient = to.strip()
    if not recipient:
        raise EmailDeliveryError("Пустой адрес получателя")

    if not settings.smtp_configured:
        if settings.is_production:
            raise EmailDeliveryError("SMTP не настроен")
        logger.info(
            "DEV email skipped (SMTP not configured)\nTo: %s\nSubject: %s\n\n%s",
            recipient,
            subject,
            text_body,
        )
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.smtp_from_address
    message["To"] = recipient
    message.attach(MIMEText(text_body, "plain", "utf-8"))
    message.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=30) as client:
                if settings.smtp_user:
                    client.login(settings.smtp_user, settings.smtp_password)
                client.send_message(message)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as client:
                if settings.smtp_use_tls:
                    client.starttls()
                if settings.smtp_user:
                    client.login(settings.smtp_user, settings.smtp_password)
                client.send_message(message)
    except OSError as exc:
        logger.exception("SMTP connection failed")
        raise EmailDeliveryError("Ошибка соединения с почтовым сервером") from exc
    except smtplib.SMTPException as exc:
        logger.exception("SMTP send failed")
        raise EmailDeliveryError("Почтовый сервер отклонил отправку") from exc
