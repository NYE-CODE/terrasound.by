import unittest
from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.site_stats import SiteStats
from app.schemas.site_stats import SiteStatsUpdate
from app.services.site_home import SITE_HOME, get_site_home, site_home_cache
from app.services.site_stats import site_stats_to_out, update_site_stats


class SiteStatsServiceTests(unittest.TestCase):
    def test_site_stats_to_out_includes_enabled_flag(self) -> None:
        stats = SimpleNamespace(
            installations_completed="1200+",
            years_expertise="8",
            enabled=False,
        )

        result = site_stats_to_out(stats)

        self.assertEqual(result.installations_completed, "1200+")
        self.assertEqual(result.years_expertise, "8")
        self.assertFalse(result.enabled)

    def test_site_stats_to_out_when_enabled(self) -> None:
        stats = SimpleNamespace(
            installations_completed="500+",
            years_expertise="10",
            enabled=True,
        )

        result = site_stats_to_out(stats)

        self.assertTrue(result.enabled)


class UpdateSiteStatsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.db.add(
            SiteStats(
                id=1,
                installations_completed="1200+",
                years_expertise="8",
                enabled=False,
            )
        )
        self.db.commit()
        site_home_cache.invalidate(SITE_HOME)

    def tearDown(self) -> None:
        site_home_cache.invalidate(SITE_HOME)
        self.db.close()

    def test_update_site_stats_refreshes_site_home_cache(self) -> None:
        cached_home = get_site_home(self.db)
        self.assertFalse(cached_home.stats.enabled)

        update_site_stats(
            self.db,
            SiteStatsUpdate(
                installations_completed="1200+",
                years_expertise="8",
                enabled=True,
            ),
        )

        refreshed_home = get_site_home(self.db)
        self.assertTrue(refreshed_home.stats.enabled)


if __name__ == "__main__":
    unittest.main()
