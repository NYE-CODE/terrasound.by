import tempfile
import unittest
import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from app.schemas.content import ProductAdminOut, ProductCreate
from app.schemas.product import ProductDetailOut
from app.services import media
from app.services.products import product_gallery_urls


def _product(*, product_id: str = "3081558a-d609-4b3e-a6f0-e044b701aa4d", image_url: str, gallery: list[tuple[str, int]]) -> SimpleNamespace:
    images = [
        SimpleNamespace(url=url, sort_order=sort_order)
        for url, sort_order in gallery
    ]
    return SimpleNamespace(id=product_id, image_url=image_url, images=images)


class ProductGalleryUrlsTests(unittest.TestCase):
    def test_main_image_is_first_when_gallery_differs(self) -> None:
        product = _product(
            image_url="/uploads/products/a/main.webp",
            gallery=[
                ("/uploads/products/a/old.webp", 0),
                ("/uploads/products/a/extra.webp", 1),
            ],
        )

        self.assertEqual(
            product_gallery_urls(product),
            [
                "/uploads/products/a/main.webp",
                "/uploads/products/a/old.webp",
                "/uploads/products/a/extra.webp",
            ],
        )

    def test_deduplicates_main_in_gallery(self) -> None:
        product = _product(
            image_url="/uploads/products/a/main.webp",
            gallery=[
                ("/uploads/products/a/main.webp", 0),
                ("/uploads/products/a/extra.webp", 1),
            ],
        )

        self.assertEqual(
            product_gallery_urls(product),
            [
                "/uploads/products/a/main.webp",
                "/uploads/products/a/extra.webp",
            ],
        )

    def test_falls_back_to_gallery_when_main_missing(self) -> None:
        product = _product(
            image_url="",
            gallery=[("/uploads/products/a/only.webp", 0)],
        )

        self.assertEqual(product_gallery_urls(product), ["/uploads/products/a/only.webp"])

    def test_empty_when_no_images(self) -> None:
        product = _product(image_url="", gallery=[])

        self.assertEqual(product_gallery_urls(product), [])

    def test_resolves_stale_pending_gallery_url(self) -> None:
        product_id = "3081558a-d609-4b3e-a6f0-e044b701aa4d"
        filename = "961e21feb22f47e8b609f7748c04c2a8.webp"
        finalized = f"/uploads/products/{product_id}/{filename}"
        pending = f"/uploads/products/_pending/{filename}"

        with tempfile.TemporaryDirectory() as tmpdir:
            target_dir = Path(tmpdir) / "products" / product_id
            target_dir.mkdir(parents=True)
            target_dir.joinpath(filename).write_bytes(b"webp")

            with patch.object(media.settings, "uploads_dir", tmpdir):
                product = _product(
                    product_id=product_id,
                    image_url=finalized,
                    gallery=[(pending, 0)],
                )
                self.assertEqual(product_gallery_urls(product), [finalized])


class ProductSchemaCompatibilityRemovedTests(unittest.TestCase):
    def test_product_detail_out_has_no_compatibility_field(self) -> None:
        self.assertNotIn("compatibility", ProductDetailOut.model_fields)

    def test_product_admin_out_has_no_compatibility_field(self) -> None:
        self.assertNotIn("compatibility", ProductAdminOut.model_fields)

    def test_product_create_has_no_compatibility_field(self) -> None:
        self.assertNotIn("compatibility", ProductCreate.model_fields)


if __name__ == "__main__":
    unittest.main()
