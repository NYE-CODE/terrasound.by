from __future__ import annotations

import re
import shutil
import uuid
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.config import settings

UPLOADS_URL_PREFIX = "/uploads"
CATEGORIES_URL_PREFIX = f"{UPLOADS_URL_PREFIX}/categories/"
PRODUCTS_URL_PREFIX = f"{UPLOADS_URL_PREFIX}/products/"
PORTFOLIO_URL_PREFIX = f"{UPLOADS_URL_PREFIX}/portfolio/"
PENDING_PRODUCTS_DIR = "_pending"
PENDING_PORTFOLIO_DIR = "_pending"

CATEGORY_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PRODUCT_ID_PATTERN = re.compile(r"^[0-9a-f-]{36}$", re.IGNORECASE)
PORTFOLIO_ID_PATTERN = PRODUCT_ID_PATTERN

ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_IMAGE_FORMATS = frozenset({"JPEG", "PNG", "WEBP", "MPO"})
STORED_EXTENSION = ".webp"
LEGACY_STORED_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp"})
WEBP_QUALITY = 80

MAX_EDGE_CATEGORY = 1200
MAX_EDGE_PRODUCT = 1200
MAX_EDGE_PORTFOLIO = 1600

MAX_UPLOAD_BYTES = 10 * 1024 * 1024


def uploads_root() -> Path:
    return settings.uploads_path


def is_managed_url(url: str | None) -> bool:
    if not url:
        return False
    return url.startswith(CATEGORIES_URL_PREFIX) or url.startswith(PRODUCTS_URL_PREFIX) or url.startswith(
        PORTFOLIO_URL_PREFIX
    )


def _ensure_within_uploads(path: Path) -> Path:
    root = uploads_root().resolve()
    resolved = path.resolve()
    if resolved != root and root not in resolved.parents:
        raise HTTPException(status_code=400, detail="Недопустимый путь к файлу")
    return resolved


def url_to_filesystem_path(url: str) -> Path | None:
    if not is_managed_url(url):
        return None
    relative = url.removeprefix(UPLOADS_URL_PREFIX).lstrip("/")
    return _ensure_within_uploads(uploads_root() / relative)


def delete_url_if_managed(url: str | None) -> None:
    path = url_to_filesystem_path(url or "")
    if path and path.is_file():
        path.unlink(missing_ok=True)


def delete_urls_if_managed(urls: set[str]) -> None:
    for url in urls:
        delete_url_if_managed(url)


def delete_product_media_dir(product_id: str) -> None:
    if not PRODUCT_ID_PATTERN.fullmatch(product_id):
        return
    target = _ensure_within_uploads(uploads_root() / "products" / product_id)
    if target.is_dir():
        shutil.rmtree(target, ignore_errors=True)


def delete_portfolio_media_dir(portfolio_id: str) -> None:
    if not PORTFOLIO_ID_PATTERN.fullmatch(portfolio_id):
        return
    target = _ensure_within_uploads(uploads_root() / "portfolio" / portfolio_id)
    if target.is_dir():
        shutil.rmtree(target, ignore_errors=True)


def collect_product_urls(image_url: str | None, gallery: list[str] | None) -> set[str]:
    urls: set[str] = set()
    if image_url:
        urls.add(image_url)
    for item in gallery or []:
        if item:
            urls.add(item)
    return urls


def cleanup_removed_urls(old_urls: set[str], new_urls: set[str]) -> None:
    removed = {url for url in old_urls if url not in new_urls and is_managed_url(url)}
    delete_urls_if_managed(removed)


async def _read_limited(file: UploadFile) -> bytes:
    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    extension = ALLOWED_CONTENT_TYPES.get(content_type)
    if not extension:
        raise HTTPException(status_code=400, detail="Допустимы только JPEG, PNG и WebP")

    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Файл слишком большой (максимум 10 МБ)")
        chunks.append(chunk)

    data = b"".join(chunks)
    if not data:
        raise HTTPException(status_code=400, detail="Пустой файл")
    return data


def _prepare_image(img: Image.Image) -> Image.Image:
    if img.mode in ("RGBA", "LA"):
        return img.convert("RGBA")
    if img.mode == "P" and "transparency" in img.info:
        return img.convert("RGBA")
    return img.convert("RGB")


def _resize_to_max_edge(img: Image.Image, max_edge: int) -> Image.Image:
    if max(img.size) <= max_edge:
        return img
    resized = img.copy()
    resized.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    return resized


def _encode_image_as_webp(data: bytes, *, max_edge: int) -> bytes:
    try:
        with Image.open(BytesIO(data)) as img:
            img.load()
            if img.format not in ALLOWED_IMAGE_FORMATS:
                raise HTTPException(status_code=400, detail="Допустимы только JPEG, PNG и WebP")

            prepared = _resize_to_max_edge(_prepare_image(img), max_edge)

            out = BytesIO()
            prepared.save(out, format="WEBP", quality=WEBP_QUALITY, method=4)
            return out.getvalue()
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Файл не является изображением") from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Не удалось обработать изображение") from exc


def reencode_image_file(path: Path, *, max_edge: int) -> bool:
    """Пересжать существующий файл на диске. Возвращает True, если файл обновлён."""
    if not path.is_file():
        return False
    if path.suffix.lower() not in LEGACY_STORED_EXTENSIONS:
        return False

    original_size = path.stat().st_size
    data = path.read_bytes()
    encoded = _encode_image_as_webp(data, max_edge=max_edge)
    target = path if path.suffix.lower() == STORED_EXTENSION else path.with_suffix(STORED_EXTENSION)

    if target == path and len(encoded) >= original_size:
        return False

    target.write_bytes(encoded)
    if target != path and path.exists():
        path.unlink(missing_ok=True)
    return True


async def _read_and_encode_image(file: UploadFile, *, max_edge: int) -> bytes:
    return _encode_image_as_webp(await _read_limited(file), max_edge=max_edge)


def _write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


async def save_category_image(category_id: str, file: UploadFile) -> str:
    if not CATEGORY_ID_PATTERN.fullmatch(category_id):
        raise HTTPException(status_code=400, detail="Некорректный slug категории")

    data = await _read_and_encode_image(file, max_edge=MAX_EDGE_CATEGORY)
    filename = f"{category_id}-{uuid.uuid4().hex[:8]}{STORED_EXTENSION}"
    path = uploads_root() / "categories" / filename
    _write_bytes(path, data)
    return f"{CATEGORIES_URL_PREFIX}{filename}"


async def save_product_image(product_id: str | None, file: UploadFile) -> str:
    if product_id is not None and not PRODUCT_ID_PATTERN.fullmatch(product_id):
        raise HTTPException(status_code=400, detail="Некорректный ID товара")

    data = await _read_and_encode_image(file, max_edge=MAX_EDGE_PRODUCT)
    filename = f"{uuid.uuid4().hex}{STORED_EXTENSION}"

    if product_id:
        directory = uploads_root() / "products" / product_id
        url_prefix = f"{PRODUCTS_URL_PREFIX}{product_id}/"
    else:
        directory = uploads_root() / "products" / PENDING_PRODUCTS_DIR
        url_prefix = f"{PRODUCTS_URL_PREFIX}{PENDING_PRODUCTS_DIR}/"

    path = directory / filename
    _write_bytes(path, data)
    return f"{url_prefix}{filename}"


async def save_portfolio_image(portfolio_id: str | None, file: UploadFile) -> str:
    if portfolio_id is not None and not PORTFOLIO_ID_PATTERN.fullmatch(portfolio_id):
        raise HTTPException(status_code=400, detail="Некорректный ID работы")

    data = await _read_and_encode_image(file, max_edge=MAX_EDGE_PORTFOLIO)
    filename = f"{uuid.uuid4().hex}{STORED_EXTENSION}"

    if portfolio_id:
        directory = uploads_root() / "portfolio" / portfolio_id
        url_prefix = f"{PORTFOLIO_URL_PREFIX}{portfolio_id}/"
    else:
        directory = uploads_root() / "portfolio" / PENDING_PORTFOLIO_DIR
        url_prefix = f"{PORTFOLIO_URL_PREFIX}{PENDING_PORTFOLIO_DIR}/"

    path = directory / filename
    _write_bytes(path, data)
    return f"{url_prefix}{filename}"


def _move_file(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        target.unlink()
    source.rename(target)


def _product_image_target_path(product_id: str, filename: str) -> Path:
    return uploads_root() / "products" / product_id / filename


def _product_image_target_url(product_id: str, filename: str) -> str:
    return f"{PRODUCTS_URL_PREFIX}{product_id}/{filename}"


def resolve_product_image_url(product_id: str, url: str) -> str:
    """Подставляет финальный URL, если файл уже перенесён из _pending в папку товара."""
    pending_prefix = f"{PRODUCTS_URL_PREFIX}{PENDING_PRODUCTS_DIR}/"
    if not url or not url.startswith(pending_prefix):
        return url
    if not PRODUCT_ID_PATTERN.fullmatch(product_id):
        return url

    filename = url.removeprefix(pending_prefix)
    target = _product_image_target_path(product_id, filename)
    if target.is_file():
        return _product_image_target_url(product_id, filename)
    return url


def _rewrite_pending_url(product_id: str, url: str) -> str:
    pending_prefix = f"{PRODUCTS_URL_PREFIX}{PENDING_PRODUCTS_DIR}/"
    if not url.startswith(pending_prefix):
        return url

    filename = url.removeprefix(pending_prefix)
    target = _product_image_target_path(product_id, filename)
    if target.is_file():
        return _product_image_target_url(product_id, filename)

    source = url_to_filesystem_path(url)
    if source is None or not source.is_file():
        return url

    _move_file(source, target)
    return _product_image_target_url(product_id, filename)


def _rewrite_pending_portfolio_url(portfolio_id: str, url: str) -> str:
    pending_prefix = f"{PORTFOLIO_URL_PREFIX}{PENDING_PORTFOLIO_DIR}/"
    if not url.startswith(pending_prefix):
        return url

    filename = url.removeprefix(pending_prefix)
    source = url_to_filesystem_path(url)
    if source is None or not source.is_file():
        return url

    target = uploads_root() / "portfolio" / portfolio_id / filename
    _move_file(source, target)
    return f"{PORTFOLIO_URL_PREFIX}{portfolio_id}/{filename}"


def finalize_portfolio_media(portfolio_id: str, image_url: str) -> str:
    if not PORTFOLIO_ID_PATTERN.fullmatch(portfolio_id):
        raise HTTPException(status_code=400, detail="Некорректный ID работы")
    return _rewrite_pending_portfolio_url(portfolio_id, image_url)


def finalize_product_media(product_id: str, image_url: str, gallery: list[str]) -> tuple[str, list[str]]:
    if not PRODUCT_ID_PATTERN.fullmatch(product_id):
        raise HTTPException(status_code=400, detail="Некорректный ID товара")

    new_main = _rewrite_pending_url(product_id, image_url)
    new_gallery = [_rewrite_pending_url(product_id, item) for item in gallery]
    return new_main, new_gallery


def copy_product_media(
    source_product_id: str,
    target_product_id: str,
    image_url: str,
    gallery: list[str],
) -> tuple[str, list[str]]:
    if not PRODUCT_ID_PATTERN.fullmatch(target_product_id):
        raise HTTPException(status_code=400, detail="Некорректный ID товара")

    def copy_url(url: str) -> str:
        if not is_managed_url(url):
            return url
        source = url_to_filesystem_path(url)
        if source is None or not source.is_file():
            return url

        content_type_suffix = source.suffix.lower()
        if content_type_suffix not in LEGACY_STORED_EXTENSIONS:
            content_type_suffix = STORED_EXTENSION
        filename = f"{uuid.uuid4().hex}{content_type_suffix}"
        target = uploads_root() / "products" / target_product_id / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        return f"{PRODUCTS_URL_PREFIX}{target_product_id}/{filename}"

    return copy_url(image_url), [copy_url(item) for item in gallery]


def delete_product_media(image_url: str | None, gallery: list[str] | None, product_id: str) -> None:
    urls = collect_product_urls(image_url, gallery)
    delete_urls_if_managed(urls)
    delete_product_media_dir(product_id)


def cleanup_portfolio_image_update(old_url: str | None, new_url: str | None) -> None:
    if old_url and old_url != new_url:
        delete_url_if_managed(old_url)


def delete_portfolio_media(image_url: str | None, portfolio_id: str) -> None:
    delete_url_if_managed(image_url)
    delete_portfolio_media_dir(portfolio_id)
