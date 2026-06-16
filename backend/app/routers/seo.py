import time
from datetime import datetime

from fastapi import APIRouter, Depends, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.content import BlogPost, Category
from app.models.product import Product

router = APIRouter(tags=["seo"])

SITE_ORIGIN = settings.site_origin
SITEMAP_CACHE_TTL_SECONDS = 300

STATIC_PATHS: list[tuple[str, str]] = [
    ("/", "weekly"),
    ("/catalogue", "weekly"),
    ("/installation", "weekly"),
    ("/brands", "weekly"),
    ("/blog", "weekly"),
    ("/about", "weekly"),
    ("/contact", "monthly"),
    ("/delivery", "monthly"),
    ("/privacy", "yearly"),
    ("/terms", "yearly"),
]

_sitemap_cache: dict[str, tuple[float, str]] = {}


def _format_lastmod(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%d")


def _xml_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _url_entry(loc: str, lastmod: str | None, changefreq: str) -> str:
    lines = ["  <url>", f"    <loc>{_xml_escape(loc)}</loc>"]
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    lines.append(f"    <changefreq>{changefreq}</changefreq>")
    lines.append("  </url>")
    return "\n".join(lines) + "\n"


def _build_urlset(entries: list[tuple[str, str | None, str]]) -> str:
    body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    body += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for loc, lastmod, changefreq in entries:
        body += _url_entry(loc, lastmod, changefreq)
    body += "</urlset>"
    return body


def _render_sitemap_index(children: list[tuple[str, str | None]]) -> str:
    body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    body += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for path, lastmod in children:
        loc = f"{SITE_ORIGIN}{path}"
        body += "  <sitemap>\n"
        body += f"    <loc>{_xml_escape(loc)}</loc>\n"
        if lastmod:
            body += f"    <lastmod>{lastmod}</lastmod>\n"
        body += "  </sitemap>\n"
    body += "</sitemapindex>"
    return body


def _site_content_lastmod(db: Session) -> str | None:
    product_max = db.query(func.max(Product.created_at)).scalar()
    blog_max = (
        db.query(func.max(BlogPost.created_at)).filter(BlogPost.published.is_(True)).scalar()
    )
    candidates = [dt for dt in (product_max, blog_max) if dt is not None]
    if not candidates:
        return None
    return _format_lastmod(max(candidates))


def _category_lastmods(db: Session) -> dict[str, str | None]:
    return {
        category_id: _format_lastmod(lastmod)
        for category_id, lastmod in db.query(Product.category, func.max(Product.created_at))
        .group_by(Product.category)
        .all()
    }


def build_static_sitemap(db: Session) -> str:
    site_lastmod = _site_content_lastmod(db)
    entries: list[tuple[str, str | None, str]] = [
        (f"{SITE_ORIGIN}{path}", site_lastmod, changefreq) for path, changefreq in STATIC_PATHS
    ]

    category_mods = _category_lastmods(db)
    categories = db.query(Category.id).filter(Category.published.is_(True)).all()
    for (category_id,) in categories:
        entries.append(
            (
                f"{SITE_ORIGIN}/catalogue?category={category_id}",
                category_mods.get(category_id),
                "weekly",
            )
        )

    return _build_urlset(entries)


def build_products_sitemap(db: Session) -> str:
    rows = db.query(Product.id, Product.created_at).order_by(Product.created_at.desc()).all()
    entries = [
        (f"{SITE_ORIGIN}/product/{product_id}", _format_lastmod(created_at), "weekly")
        for product_id, created_at in rows
    ]
    return _build_urlset(entries)


def build_blog_sitemap(db: Session) -> str:
    rows = (
        db.query(BlogPost.id, BlogPost.created_at)
        .filter(BlogPost.published.is_(True))
        .order_by(BlogPost.created_at.desc())
        .all()
    )
    entries = [
        (f"{SITE_ORIGIN}/blog/{post_id}", _format_lastmod(created_at), "monthly")
        for post_id, created_at in rows
    ]
    return _build_urlset(entries)


def build_sitemap_index(db: Session) -> str:
    site_lastmod = _site_content_lastmod(db)
    products_lastmod = _format_lastmod(db.query(func.max(Product.created_at)).scalar())
    blog_lastmod = _format_lastmod(
        db.query(func.max(BlogPost.created_at)).filter(BlogPost.published.is_(True)).scalar()
    )

    return _render_sitemap_index(
        [
            ("/sitemap-static.xml", site_lastmod),
            ("/sitemap-products.xml", products_lastmod),
            ("/sitemap-blog.xml", blog_lastmod),
        ]
    )


def _get_cached_or_build(key: str, builder, db: Session) -> str:
    now = time.monotonic()
    cached = _sitemap_cache.get(key)
    if cached is not None and now - cached[0] < SITEMAP_CACHE_TTL_SECONDS:
        return cached[1]
    body = builder(db)
    _sitemap_cache[key] = (now, body)
    return body


@router.get("/sitemap.xml")
def sitemap_index(db: Session = Depends(get_db)) -> Response:
    body = _get_cached_or_build("index", build_sitemap_index, db)
    return Response(content=body, media_type="application/xml")


@router.get("/sitemap-static.xml")
def sitemap_static(db: Session = Depends(get_db)) -> Response:
    body = _get_cached_or_build("static", build_static_sitemap, db)
    return Response(content=body, media_type="application/xml")


@router.get("/sitemap-products.xml")
def sitemap_products(db: Session = Depends(get_db)) -> Response:
    body = _get_cached_or_build("products", build_products_sitemap, db)
    return Response(content=body, media_type="application/xml")


@router.get("/sitemap-blog.xml")
def sitemap_blog(db: Session = Depends(get_db)) -> Response:
    body = _get_cached_or_build("blog", build_blog_sitemap, db)
    return Response(content=body, media_type="application/xml")
