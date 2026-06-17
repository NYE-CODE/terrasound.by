"""Отправка писем через SMTP (stdlib)."""

from __future__ import annotations

import logging
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr

from app.config import settings

_EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.\w+")
_EMAIL_IN_ANGLE = re.compile(r"<([^>@\s]+@[^>\s]+)>")
_ASCII_FROM_NAME = "Territoriya zvuka"

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    """Не удалось доставить письмо."""


def _is_email(value: str) -> bool:
    return bool(_EMAIL.fullmatch(value.strip()))


def _extract_from_parts(raw: str) -> tuple[str, str]:
    text = raw.strip().strip("\"'")
    if not text:
        return "", ""

    name, addr = parseaddr(text)
    if addr and _is_email(addr):
        return name.strip(), addr.strip()

    angle = _EMAIL_IN_ANGLE.search(text)
    if angle:
        addr = angle.group(1).strip()
        name = text[: angle.start()].strip().strip("\"'")
        name = _EMAIL.sub("", name).strip().strip("\"'<>")
        return name, addr

    emails = _EMAIL.findall(text)
    if len(emails) == 1:
        addr = emails[0]
        name = text.replace(addr, "").strip().strip("\"'<>")
        return name, addr

    if emails:
        return "", emails[0]

    return "", ""


def _format_from_header() -> str:
    raw = settings.smtp_from_address.strip()
    name, addr = _extract_from_parts(raw)

    if not _is_email(addr):
        addr = settings.smtp_user.strip()
        if not _is_email(addr):
            emails = _EMAIL.findall(raw)
            addr = emails[0] if emails else ""

    if not _is_email(addr):
        return raw

    if "@" in name or "<" in name or ">" in name:
        name = ""

    if name and not name.isascii():
        name = _ASCII_FROM_NAME

    if not name:
        return addr

    return formataddr((name, addr))


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
    message["From"] = _format_from_header()
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
