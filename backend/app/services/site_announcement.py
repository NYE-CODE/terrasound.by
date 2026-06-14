from sqlalchemy.orm import Session

from app.cache import SITE_ANNOUNCEMENT, site_announcement_cache
from app.db_commit import commit_or_raise
from app.models.site_announcement import DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS, SiteAnnouncement
from app.schemas.site_announcement import SiteAnnouncementOut, SiteAnnouncementUpdate


def get_or_create_site_announcement(db: Session) -> SiteAnnouncement:
    announcement = db.query(SiteAnnouncement).filter(SiteAnnouncement.id == 1).first()
    if announcement:
        return announcement

    announcement = SiteAnnouncement(
        id=1,
        text="",
        enabled=False,
        scroll_duration_seconds=DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS,
    )
    db.add(announcement)
    commit_or_raise(db)
    db.refresh(announcement)
    return announcement


def site_announcement_to_out(announcement: SiteAnnouncement) -> SiteAnnouncementOut:
    return SiteAnnouncementOut(
        text=announcement.text,
        enabled=announcement.enabled,
        scroll_duration_seconds=announcement.scroll_duration_seconds,
    )


def get_public_site_announcement(db: Session) -> SiteAnnouncementOut:
    def load() -> dict:
        return site_announcement_to_out(get_or_create_site_announcement(db)).model_dump(by_alias=True)

    data = site_announcement_cache.get(SITE_ANNOUNCEMENT, load)
    return SiteAnnouncementOut.model_validate(data)


def update_site_announcement(db: Session, payload: SiteAnnouncementUpdate) -> SiteAnnouncement:
    announcement = get_or_create_site_announcement(db)
    announcement.text = payload.text.strip()
    announcement.enabled = payload.enabled
    announcement.scroll_duration_seconds = payload.scroll_duration_seconds
    commit_or_raise(db)
    db.refresh(announcement)
    site_announcement_cache.invalidate(SITE_ANNOUNCEMENT)
    return announcement
