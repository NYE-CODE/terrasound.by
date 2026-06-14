from app.schemas.common import CamelModel
from app.schemas.content import BrandOut, PortfolioWorkOut
from app.schemas.product import ProductCardOut
from app.schemas.review import ServiceReviewOut
from app.schemas.site_stats import SiteStatsOut


class SiteHomeOut(CamelModel):
    stats: SiteStatsOut
    featured_products: list[ProductCardOut]
    portfolio_works: list[PortfolioWorkOut]
    brands: list[BrandOut]
    service_reviews: list[ServiceReviewOut]
