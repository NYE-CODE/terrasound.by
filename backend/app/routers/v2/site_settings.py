from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V2_PREFIX, API_V2_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.product_highlights import ProductHighlightsOut, ProductHighlightsUpdate
from app.schemas.site_announcement import SiteAnnouncementOut, SiteAnnouncementUpdate
from app.schemas.site_contact import SiteContactOut, SiteContactUpdate
from app.schemas.site_stats import SiteStatsOut, SiteStatsUpdate
from app.services.product_highlights import (
    get_or_create_product_highlights,
    get_public_product_highlights,
    product_highlights_to_out,
    update_product_highlights,
)
from app.services.site_announcement import (
    get_or_create_site_announcement,
    get_public_site_announcement,
    site_announcement_to_out,
    update_site_announcement,
)
from app.services.site_contact import (
    get_or_create_site_contact,
    get_public_site_contact,
    site_contact_to_out,
    update_site_contact,
)
from app.services.site_stats import (
    get_or_create_site_stats,
    get_public_site_stats,
    site_stats_to_out,
    update_site_stats,
)

public_router = APIRouter(prefix=f"{API_V2_PREFIX}/site/settings", tags=["site-settings"])
admin_router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}/site/settings",
    tags=["admin-site-settings"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@public_router.get("/stats", response_model=SiteStatsOut)
def get_site_stats_v2(db: Annotated[Session, Depends(get_db)]) -> SiteStatsOut:
    return get_public_site_stats(db)


@public_router.get("/contact", response_model=SiteContactOut)
def get_site_contact_v2(db: Annotated[Session, Depends(get_db)]) -> SiteContactOut:
    return get_public_site_contact(db)


@public_router.get("/announcement", response_model=SiteAnnouncementOut)
def get_site_announcement_v2(db: Annotated[Session, Depends(get_db)]) -> SiteAnnouncementOut:
    return get_public_site_announcement(db)


@public_router.get("/product-highlights", response_model=ProductHighlightsOut)
def get_product_highlights_v2(db: Annotated[Session, Depends(get_db)]) -> ProductHighlightsOut:
    return get_public_product_highlights(db)


@admin_router.get("/stats", response_model=SiteStatsOut)
def get_admin_site_stats_v2(db: Annotated[Session, Depends(get_db)]) -> SiteStatsOut:
    return site_stats_to_out(get_or_create_site_stats(db))


@admin_router.patch("/stats", response_model=SiteStatsOut)
def patch_site_stats_v2(
    payload: SiteStatsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteStatsOut:
    return site_stats_to_out(update_site_stats(db, payload))


@admin_router.get("/contact", response_model=SiteContactOut)
def get_admin_site_contact_v2(db: Annotated[Session, Depends(get_db)]) -> SiteContactOut:
    return site_contact_to_out(get_or_create_site_contact(db))


@admin_router.patch("/contact", response_model=SiteContactOut)
def patch_site_contact_v2(
    payload: SiteContactUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteContactOut:
    return site_contact_to_out(update_site_contact(db, payload))


@admin_router.get("/announcement", response_model=SiteAnnouncementOut)
def get_admin_site_announcement_v2(db: Annotated[Session, Depends(get_db)]) -> SiteAnnouncementOut:
    return site_announcement_to_out(get_or_create_site_announcement(db))


@admin_router.patch("/announcement", response_model=SiteAnnouncementOut)
def patch_site_announcement_v2(
    payload: SiteAnnouncementUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteAnnouncementOut:
    return site_announcement_to_out(update_site_announcement(db, payload))


@admin_router.get("/product-highlights", response_model=ProductHighlightsOut)
def get_admin_product_highlights_v2(db: Annotated[Session, Depends(get_db)]) -> ProductHighlightsOut:
    return product_highlights_to_out(get_or_create_product_highlights(db))


@admin_router.patch("/product-highlights", response_model=ProductHighlightsOut)
def patch_product_highlights_v2(
    payload: ProductHighlightsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductHighlightsOut:
    return product_highlights_to_out(update_product_highlights(db, payload))
