from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.exceptions import (
    integrity_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from sqlalchemy.exc import IntegrityError
from app.rate_limit import RateLimitMiddleware
from app.database import Base, SessionLocal, engine
from app.migrations import run_migrations
from app.api_constants import API_V1_PREFIX, API_V2_PREFIX
from app.middleware.deprecation import ApiDeprecationMiddleware
from app.routers import catalog, content, installation, orders, product_highlights, products, reviews, seo, site_announcement, site_contact, site_stats, vehicles
from app.routers.admin import auth as admin_auth
from app.routers.admin import content as admin_content
from app.routers.admin import dashboard as admin_dashboard
from app.routers.admin import installation as admin_installation
from app.routers.admin import orders as admin_orders
from app.routers.admin import attributes as admin_attributes
from app.routers.admin import products as admin_products
from app.routers.admin import reviews as admin_reviews
from app.routers.admin import site_contact as admin_site_contact
from app.routers.admin import site_announcement as admin_site_announcement
from app.routers.admin import product_highlights as admin_product_highlights
from app.routers.admin import site_stats as admin_site_stats
from app.routers.admin import uploads as admin_uploads
from app.routers.v2 import content as v2_content
from app.routers.v2 import installation as v2_installation
from app.routers.v2 import orders as v2_orders
from app.routers.v2 import products as v2_products
from app.routers.v2 import reviews as v2_reviews
from app.routers.v2 import site_home as v2_site_home
from app.routers.v2 import site_settings as v2_site_settings
from app.routers.v2 import vehicles as v2_vehicles
from app.routers.v2.admin import auth as v2_admin_auth
from app.routers.v2.admin import content as v2_admin_content
from app.routers.v2.admin import core as v2_admin_core
from app.routers.v2.admin import images as v2_admin_images
from app.routers.v2.admin import products as v2_admin_products
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    db = SessionLocal()
    try:
        if not settings.is_production:
            seed_database(db)
    finally:
        db.close()
    settings.uploads_path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="Terrasound API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.add_middleware(ApiDeprecationMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=(
        r"https?://("
        r"localhost|127\.0\.0\.1"
        r"|\d{1,3}(?:\.\d{1,3}){3}"
        r"|admin\.terrasound\.by"
        r"|terrasound\.by"
        r"|www\.terrasound\.by"
        r")(:\d+)?"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(products.router)
app.include_router(reviews.router)
app.include_router(orders.router)
app.include_router(installation.router)
app.include_router(content.router)
app.include_router(vehicles.router)
app.include_router(seo.router)
app.include_router(site_stats.router)
app.include_router(site_announcement.router)
app.include_router(product_highlights.router)
app.include_router(site_contact.router)
app.include_router(admin_auth.router)
app.include_router(admin_dashboard.router)
if settings.enable_leads_admin_api:
    app.include_router(admin_orders.router)
app.include_router(admin_reviews.router)
if settings.enable_leads_admin_api:
    app.include_router(admin_installation.router)
app.include_router(admin_products.router)
app.include_router(admin_attributes.router)
app.include_router(admin_content.router)
app.include_router(admin_site_stats.router)
app.include_router(admin_site_announcement.router)
app.include_router(admin_product_highlights.router)
app.include_router(admin_site_contact.router)
app.include_router(admin_uploads.router)

# API v2
app.include_router(v2_products.router)
app.include_router(v2_orders.router)
app.include_router(v2_content.router)
app.include_router(v2_reviews.router)
app.include_router(v2_installation.router)
app.include_router(v2_vehicles.router)
app.include_router(v2_site_settings.public_router)
app.include_router(v2_site_home.router)
app.include_router(v2_admin_auth.router)
app.include_router(v2_admin_core.dashboard_router)
if settings.enable_leads_admin_api:
    app.include_router(v2_admin_core.orders_router)
app.include_router(v2_admin_core.reviews_router)
app.include_router(v2_admin_core.attributes_router)
if settings.enable_leads_admin_api:
    app.include_router(v2_admin_core.installation_requests_router)
app.include_router(v2_admin_products.router)
app.include_router(v2_admin_content.router)
app.include_router(v2_admin_images.router)
app.include_router(v2_site_settings.admin_router)

if settings.uploads_path.is_dir():
    app.mount("/uploads", StaticFiles(directory=settings.uploads_path), name="uploads")


@app.get("/api/health")
@app.get(f"{API_V1_PREFIX}/health")
@app.get(f"{API_V2_PREFIX}/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
