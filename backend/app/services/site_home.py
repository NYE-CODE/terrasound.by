from sqlalchemy.orm import Session

from app.cache import TTLCache, content_cache
from app.models.content import Brand, PortfolioWork
from app.models.review import ServiceReview
from app.schemas.content import BrandOut, PortfolioWorkOut
from app.schemas.product import ProductCardOut
from app.schemas.review import ServiceReviewOut
from app.schemas.site_home import SiteHomeOut
from app.services.products import list_products
from app.services.site_stats import get_public_site_stats

SITE_HOME = "site:home"
site_home_cache = TTLCache()

HOME_FEATURED_PRODUCTS = 3
HOME_PORTFOLIO_LIMIT = 500
HOME_SERVICE_REVIEWS_LIMIT = 100


def _load_brands(db: Session) -> list[BrandOut]:
    def load() -> list[dict]:
        items = (
            db.query(Brand)
            .filter(Brand.published.is_(True))
            .order_by(Brand.sort_order, Brand.name)
            .all()
        )
        return [BrandOut.model_validate(item).model_dump(by_alias=True) for item in items]

    cached = content_cache.get("content:brands", load)
    return [BrandOut.model_validate(item) for item in cached]


def _load_portfolio(db: Session) -> list[PortfolioWorkOut]:
    items = (
        db.query(PortfolioWork)
        .filter(PortfolioWork.published.is_(True))
        .order_by(PortfolioWork.sort_order, PortfolioWork.title)
        .limit(HOME_PORTFOLIO_LIMIT)
        .all()
    )
    return [PortfolioWorkOut.model_validate(item) for item in items]


def _load_service_reviews(db: Session) -> list[ServiceReviewOut]:
    items = (
        db.query(ServiceReview)
        .filter(ServiceReview.published.is_(True))
        .order_by(ServiceReview.created_at.desc())
        .limit(HOME_SERVICE_REVIEWS_LIMIT)
        .all()
    )
    return [ServiceReviewOut.model_validate(item) for item in items]


def get_site_home(db: Session) -> SiteHomeOut:
    def load() -> dict:
        featured = list_products(db, sort="popularity", limit=HOME_FEATURED_PRODUCTS).data
        return SiteHomeOut(
            stats=get_public_site_stats(db),
            featured_products=featured,
            portfolio_works=_load_portfolio(db),
            brands=_load_brands(db),
            service_reviews=_load_service_reviews(db),
        ).model_dump(by_alias=True)

    data = site_home_cache.get(SITE_HOME, load)
    return SiteHomeOut.model_validate(data)


def invalidate_site_home_cache() -> None:
    site_home_cache.invalidate(SITE_HOME)
