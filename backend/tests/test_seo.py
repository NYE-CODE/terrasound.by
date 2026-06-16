import unittest
from datetime import datetime

from app.routers.seo import _build_urlset, _format_lastmod, _render_sitemap_index, _xml_escape


class SeoSitemapTests(unittest.TestCase):
    def test_format_lastmod(self) -> None:
        self.assertEqual(_format_lastmod(datetime(2026, 3, 15, 12, 0, 0)), "2026-03-15")
        self.assertIsNone(_format_lastmod(None))

    def test_xml_escape(self) -> None:
        self.assertEqual(_xml_escape("a&b"), "a&amp;b")

    def test_urlset_contains_lastmod(self) -> None:
        body = _build_urlset([("https://terrasound.by/", "2026-03-01", "weekly")])
        self.assertIn("<lastmod>2026-03-01</lastmod>", body)
        self.assertIn("<loc>https://terrasound.by/</loc>", body)

    def test_sitemap_index_lists_children(self) -> None:
        body = _render_sitemap_index(
            [
                ("/sitemap-static.xml", "2026-03-01"),
                ("/sitemap-products.xml", "2026-03-15"),
            ]
        )
        self.assertIn("<sitemapindex", body)
        self.assertIn("/sitemap-products.xml", body)


if __name__ == "__main__":
    unittest.main()
