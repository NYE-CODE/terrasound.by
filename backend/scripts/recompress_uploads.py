"""Пересжатие существующих файлов в uploads/ (запуск из backend/: python scripts/recompress_uploads.py)."""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings  # noqa: E402
from app.services.media import (  # noqa: E402
    LEGACY_STORED_EXTENSIONS,
    MAX_EDGE_CATEGORY,
    MAX_EDGE_PORTFOLIO,
    MAX_EDGE_PRODUCT,
    reencode_image_file,
)


def max_edge_for(relative: Path) -> int:
    parts = relative.parts
    if "categories" in parts:
        return MAX_EDGE_CATEGORY
    if "portfolio" in parts:
        return MAX_EDGE_PORTFOLIO
    if "products" in parts:
        return MAX_EDGE_PRODUCT
    return MAX_EDGE_PRODUCT


def main() -> None:
    root = settings.uploads_path
    if not root.is_dir():
        print(f"Uploads not found: {root}")
        return

    updated = 0
    skipped = 0

    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() != ".webp":
            skipped += 1
            continue
        relative = path.relative_to(root)
        if reencode_image_file(path, max_edge=max_edge_for(relative)):
            updated += 1
            print(f"OK  {relative}")
        else:
            skipped += 1

    print(f"Done. Updated: {updated}, skipped: {skipped}.")


if __name__ == "__main__":
    main()
