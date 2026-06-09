from sqlalchemy.orm import Session

from app.cache import SITE_STATS, site_stats_cache
from app.models.site_stats import SiteStats
from app.schemas.site_stats import SiteStatsOut, SiteStatsUpdate

DEFAULT_INSTALLATIONS = 1200
DEFAULT_YEARS = 8


def get_or_create_site_stats(db: Session) -> SiteStats:
    stats = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if stats:
        return stats

    stats = SiteStats(
        id=1,
        installations_completed=DEFAULT_INSTALLATIONS,
        years_expertise=DEFAULT_YEARS,
    )
    db.add(stats)
    db.commit()
    db.refresh(stats)
    return stats


def site_stats_to_out(stats: SiteStats) -> SiteStatsOut:
    return SiteStatsOut(
        installations_completed=stats.installations_completed,
        years_expertise=stats.years_expertise,
    )


def get_public_site_stats(db: Session) -> SiteStatsOut:
    def load() -> dict:
        return site_stats_to_out(get_or_create_site_stats(db)).model_dump(by_alias=True)

    data = site_stats_cache.get(SITE_STATS, load)
    return SiteStatsOut.model_validate(data)


def update_site_stats(db: Session, payload: SiteStatsUpdate) -> SiteStats:
    stats = get_or_create_site_stats(db)
    stats.installations_completed = payload.installations_completed
    stats.years_expertise = payload.years_expertise
    db.commit()
    db.refresh(stats)
    site_stats_cache.invalidate(SITE_STATS)
    return stats
