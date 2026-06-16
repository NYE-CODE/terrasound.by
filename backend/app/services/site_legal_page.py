from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.cache import SITE_LEGAL_PAGE_PREFIX, site_legal_page_cache
from app.db_commit import commit_or_raise
from app.models.site_legal_page import (
    LEGAL_PAGE_PRIVACY,
    LEGAL_PAGE_SLUGS,
    LEGAL_PAGE_TERMS,
    SiteLegalPage,
)
from app.schemas.site_legal_page import SiteLegalPageOut, SiteLegalPageUpdate

DEFAULT_PRIVACY_TITLE = "Политика конфиденциальности"
DEFAULT_PRIVACY_CONTENT = """## Какие данные мы собираем

Мы собираем информацию, которую вы предоставляете напрямую при оформлении заказа, создании аккаунта, записи на установку или обращении в службу поддержки.

## Как мы используем ваши данные

Мы используем собранную информацию для обработки заказов, связи с вами по поводу записи на установку и улучшения наших услуг.

## Безопасность данных

Мы применяем надлежащие меры безопасности для защиты ваших персональных данных от несанкционированного доступа, изменения или раскрытия.

## Контакты

По вопросам политики конфиденциальности обращайтесь в ООО «Территория звука»: info@terrasound.by"""

DEFAULT_TERMS_TITLE = "Условия использования"
DEFAULT_TERMS_CONTENT = """## Продажа товаров

На все товары распространяется гарантия производителя. На услуги установки предоставляется 2 года гарантии на выполненные работы.

## Услуги установки

Мы работаем только по записи. Отмена должна быть произведена не менее чем за 48 часов, иначе взимается плата за отмену.

## Возврат и возмещение

Не вскрытые товары можно вернуть в течение 14 дней с момента покупки. Установленное оборудование возврату не подлежит, за исключением случаев брака.

## Контакты

Вопросы по условиям? Свяжитесь с ООО «Территория звука»: info@terrasound.by или +375 33 917 7444"""

DEFAULTS: dict[str, tuple[str, str]] = {
    LEGAL_PAGE_PRIVACY: (DEFAULT_PRIVACY_TITLE, DEFAULT_PRIVACY_CONTENT),
    LEGAL_PAGE_TERMS: (DEFAULT_TERMS_TITLE, DEFAULT_TERMS_CONTENT),
}


def legal_page_cache_key(slug: str) -> str:
    return f"{SITE_LEGAL_PAGE_PREFIX}:{slug}"


def ensure_valid_slug(slug: str) -> str:
    normalized = slug.strip().lower()
    if normalized not in LEGAL_PAGE_SLUGS:
        raise HTTPException(status_code=404, detail="Страница не найдена")
    return normalized


def get_or_create_legal_page(db: Session, slug: str) -> SiteLegalPage:
    slug = ensure_valid_slug(slug)
    page = db.query(SiteLegalPage).filter(SiteLegalPage.slug == slug).first()
    if page:
        return page

    title, content = DEFAULTS[slug]
    page = SiteLegalPage(slug=slug, title=title, content=content, updated_at=datetime.utcnow())
    db.add(page)
    commit_or_raise(db)
    db.refresh(page)
    return page


def site_legal_page_to_out(page: SiteLegalPage) -> SiteLegalPageOut:
    return SiteLegalPageOut(
        slug=page.slug,
        title=page.title,
        content=page.content,
        updated_at=page.updated_at,
    )


def get_public_legal_page(db: Session, slug: str) -> SiteLegalPageOut:
    slug = ensure_valid_slug(slug)

    def load() -> dict:
        return site_legal_page_to_out(get_or_create_legal_page(db, slug)).model_dump(by_alias=True)

    data = site_legal_page_cache.get(legal_page_cache_key(slug), load)
    return SiteLegalPageOut.model_validate(data)


def list_legal_pages(db: Session) -> list[SiteLegalPageOut]:
    pages: list[SiteLegalPageOut] = []
    for slug in sorted(LEGAL_PAGE_SLUGS):
        pages.append(site_legal_page_to_out(get_or_create_legal_page(db, slug)))
    return pages


def update_legal_page(db: Session, slug: str, payload: SiteLegalPageUpdate) -> SiteLegalPage:
    slug = ensure_valid_slug(slug)
    page = get_or_create_legal_page(db, slug)
    page.title = payload.title.strip()
    page.content = payload.content.strip()
    page.updated_at = datetime.utcnow()
    commit_or_raise(db)
    db.refresh(page)
    site_legal_page_cache.invalidate(legal_page_cache_key(slug))
    return page


def seed_legal_pages(db: Session) -> None:
    for slug in LEGAL_PAGE_SLUGS:
        get_or_create_legal_page(db, slug)
