from sqlalchemy.orm import Session

from app.cache import SITE_CONTACT, site_contact_cache
from app.db_commit import commit_or_raise
from app.contact_utils import (
    DEFAULT_MAP_LAT,
    DEFAULT_MAP_LON,
    address_to_maps_url,
    phone_to_tel,
    resolve_map_embed_url,
    resolve_maps_open_url,
)
from app.models.site_contact import SiteContact
from app.schemas.site_contact import SiteContactOut, SiteContactUpdate

DEFAULT_PHONE = "+375 33 917 7444"
DEFAULT_EMAIL = "info@terrasound.by"
DEFAULT_INSTAGRAM = "https://instagram.com/terrasound.by"
DEFAULT_TIKTOK = "https://www.tiktok.com/@terrasound.by"
DEFAULT_TELEGRAM = "https://t.me/terrasound_by"
DEFAULT_ADDRESS = "г. Гродно, Озерское шоссе, 14"
DEFAULT_WORKING_HOURS = "Пн–Пт, 10:00–18:00, обед 14:00–15:00"


def get_or_create_site_contact(db: Session) -> SiteContact:
    contact = db.query(SiteContact).filter(SiteContact.id == 1).first()
    if contact:
        return contact

    contact = SiteContact(
        id=1,
        phone=DEFAULT_PHONE,
        email=DEFAULT_EMAIL,
        instagram_url=DEFAULT_INSTAGRAM,
        tiktok_url=DEFAULT_TIKTOK,
        telegram_url=DEFAULT_TELEGRAM,
        address=DEFAULT_ADDRESS,
        maps_url=address_to_maps_url(DEFAULT_ADDRESS),
        map_lat=DEFAULT_MAP_LAT,
        map_lon=DEFAULT_MAP_LON,
        working_hours=DEFAULT_WORKING_HOURS,
    )
    db.add(contact)
    commit_or_raise(db)
    db.refresh(contact)
    return contact


def site_contact_to_out(contact: SiteContact) -> SiteContactOut:
    return SiteContactOut(
        phone=contact.phone,
        email=contact.email,
        instagram_url=contact.instagram_url,
        tiktok_url=contact.tiktok_url,
        telegram_url=contact.telegram_url,
        address=contact.address,
        working_hours=contact.working_hours,
        phone_tel=phone_to_tel(contact.phone),
        map_lat=contact.map_lat,
        map_lon=contact.map_lon,
        address_maps_url=resolve_maps_open_url(
            address=contact.address,
            maps_url=contact.maps_url,
            map_lat=contact.map_lat,
            map_lon=contact.map_lon,
        ),
        map_embed_url=resolve_map_embed_url(
            address=contact.address,
            map_lat=contact.map_lat,
            map_lon=contact.map_lon,
        ),
    )


def get_public_site_contact(db: Session) -> SiteContactOut:
    def load() -> dict:
        return site_contact_to_out(get_or_create_site_contact(db)).model_dump(by_alias=True)

    data = site_contact_cache.get(SITE_CONTACT, load)
    return SiteContactOut.model_validate(data)


def update_site_contact(db: Session, payload: SiteContactUpdate) -> SiteContact:
    contact = get_or_create_site_contact(db)
    contact.phone = payload.phone.strip()
    contact.email = str(payload.email).strip()
    contact.instagram_url = payload.instagram_url.strip()
    contact.tiktok_url = payload.tiktok_url.strip()
    contact.telegram_url = payload.telegram_url.strip()
    contact.address = payload.address.strip()
    contact.map_lat = payload.map_lat
    contact.map_lon = payload.map_lon
    contact.working_hours = payload.working_hours.strip()
    commit_or_raise(db)
    db.refresh(contact)
    site_contact_cache.invalidate(SITE_CONTACT)
    return contact
