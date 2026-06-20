import asyncio
import tempfile
import unittest
import uuid
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.services import media


def _make_png_bytes() -> bytes:
    out = BytesIO()
    Image.new("RGB", (4, 4), color="red").save(out, format="PNG")
    return out.getvalue()


class MediaServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self.root = Path(self._tmpdir.name)
        self.settings_patch = patch.object(media.settings, "uploads_dir", str(self.root))
        self.settings_patch.start()

    def tearDown(self) -> None:
        self.settings_patch.stop()
        self._tmpdir.cleanup()

    def _upload(self, content: bytes, content_type: str = "image/png") -> UploadFile:
        return UploadFile(filename="test.png", file=BytesIO(content), headers={"content-type": content_type})

    def test_save_and_finalize_pending_product_image(self) -> None:
        file = self._upload(_make_png_bytes())
        pending_url = asyncio.run(media.save_product_image(None, file))
        self.assertIn("/uploads/products/_pending/", pending_url)
        self.assertTrue(pending_url.endswith(".webp"))

        product_id = str(uuid.uuid4())
        main, gallery = media.finalize_product_media(product_id, pending_url, [])
        self.assertTrue(main.startswith(f"/uploads/products/{product_id}/"))
        self.assertEqual(gallery, [])
        self.assertTrue((self.root / "products" / product_id).exists())

    def test_finalize_duplicate_pending_url_in_main_and_gallery(self) -> None:
        file = self._upload(_make_png_bytes())
        pending_url = asyncio.run(media.save_product_image(None, file))
        product_id = str(uuid.uuid4())

        main, gallery = media.finalize_product_media(product_id, pending_url, [pending_url])
        expected = f"/uploads/products/{product_id}/{Path(pending_url).name}"

        self.assertEqual(main, expected)
        self.assertEqual(gallery, [expected])
        self.assertFalse((self.root / "products" / media.PENDING_PRODUCTS_DIR / Path(pending_url).name).exists())

    def test_resolve_product_image_url_when_pending_file_already_moved(self) -> None:
        product_id = str(uuid.uuid4())
        filename = "961e21feb22f47e8b609f7748c04c2a8.webp"
        target_dir = self.root / "products" / product_id
        target_dir.mkdir(parents=True)
        (target_dir / filename).write_bytes(_make_png_bytes())

        pending_url = f"/uploads/products/{media.PENDING_PRODUCTS_DIR}/{filename}"
        resolved = media.resolve_product_image_url(product_id, pending_url)

        self.assertEqual(resolved, f"/uploads/products/{product_id}/{filename}")

    def test_save_and_finalize_pending_portfolio_image(self) -> None:
        file = self._upload(_make_png_bytes())
        pending_url = asyncio.run(media.save_portfolio_image(None, file))
        self.assertIn("/uploads/portfolio/_pending/", pending_url)
        self.assertTrue(pending_url.endswith(".webp"))

        work_id = str(uuid.uuid4())
        main = media.finalize_portfolio_media(work_id, pending_url)
        self.assertTrue(main.startswith(f"/uploads/portfolio/{work_id}/"))
        self.assertTrue((self.root / "portfolio" / work_id).exists())

    def test_rejects_invalid_image_bytes(self) -> None:
        file = self._upload(b"\x89PNG\r\n\x1a\nnot-a-real-image")
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(media.save_product_image(None, file))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_cleanup_removed_urls(self) -> None:
        category_path = self.root / "categories" / "speakers-deadbeef.png"
        category_path.parent.mkdir(parents=True)
        category_path.write_bytes(b"png")
        url = "/uploads/categories/speakers-deadbeef.png"

        media.cleanup_removed_urls({url}, set())
        self.assertFalse(category_path.exists())

    def test_large_image_is_resized_on_upload(self) -> None:
        out = BytesIO()
        Image.new("RGB", (2400, 1800), color="blue").save(out, format="JPEG")
        file = self._upload(out.getvalue(), content_type="image/jpeg")

        pending_url = asyncio.run(media.save_portfolio_image(None, file))
        path = media.url_to_filesystem_path(pending_url)
        self.assertIsNotNone(path)
        with Image.open(path) as img:
            self.assertLessEqual(max(img.size), media.MAX_EDGE_PORTFOLIO)

    def test_copy_product_media(self) -> None:
        product_id = str(uuid.uuid4())
        target_id = str(uuid.uuid4())
        source_dir = self.root / "products" / product_id
        source_dir.mkdir(parents=True)
        source_file = source_dir / "photo.webp"
        source_file.write_bytes(_make_png_bytes())
        source_url = f"/uploads/products/{product_id}/photo.webp"

        main, gallery = media.copy_product_media(product_id, target_id, source_url, [])
        self.assertNotEqual(main, source_url)
        self.assertTrue((self.root / "products" / target_id).exists())


if __name__ == "__main__":
    unittest.main()
