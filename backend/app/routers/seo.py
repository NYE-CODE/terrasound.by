from datetime import datetime

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.content import BlogPost, Category
from app.models.product import Product

router = APIRouter(tags=["seo"])

SITE_ORIGIN = settings.site_origin

STATIC_PATHS = [
    "/",
    "/catalogue",
    "/installation",
    "/brands",
    "/blog",
    "/about",
    "/contact",
    "/delivery",
    "/privacy",
    "/terms",
]


@router.get("/sitemap.xml")
def sitemap(db: Session = Depends(get_db)) -> Response:
    urls: list[tuple[str, str]] = [(path, "weekly") for path in STATIC_PATHS]

    categories = db.query(Category).filter(Category.published.is_(True)).all()
    for category in categories:
        urls.append((f"/catalogue?category={category.id}", "weekly"))

    products = db.query(Product.id).filter(Product.in_stock.is_(True)).all()
    for (product_id,) in products:
        urls.append((f"/product/{product_id}", "weekly"))

    posts = db.query(BlogPost.id).filter(BlogPost.published.is_(True)).all()
    for (post_id,) in posts:
        urls.append((f"/blog/{post_id}", "monthly"))

    today = datetime.utcnow().strftime("%Y-%m-%d")
    body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    body += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for path, changefreq in urls:
        loc = f"{SITE_ORIGIN}{path}"
        body += "  <url>\n"
        body += f"    <loc>{loc}</loc>\n"
        body += f"    <lastmod>{today}</lastmod>\n"
        body += f"    <changefreq>{changefreq}</changefreq>\n"
        body += "  </url>\n"
    body += "</urlset>"

    return Response(content=body, media_type="application/xml")
