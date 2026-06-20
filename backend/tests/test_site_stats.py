import unittest
from types import SimpleNamespace

from app.services.site_stats import site_stats_to_out


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


if __name__ == "__main__":
    unittest.main()
