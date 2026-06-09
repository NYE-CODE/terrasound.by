from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.exceptions import unhandled_exception_handler, validation_exception_handler
from app.rate_limit import RateLimitMiddleware
from app.database import Base, SessionLocal, engine
from app.migrations import run_migrations
from app.routers import content, installation, orders, products, reviews, seo, site_stats, vehicles
from app.routers.admin import auth as admin_auth
from app.routers.admin import content as admin_content
from app.routers.admin import dashboard as admin_dashboard
from app.routers.admin import installation as admin_installation
from app.routers.admin import orders as admin_orders
from app.routers.admin import products as admin_products
from app.routers.admin import reviews as admin_reviews
from app.routers.admin import site_stats as admin_site_stats
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
    yield


app = FastAPI(
    title="Terrasound API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(reviews.router)
app.include_router(orders.router)
app.include_router(installation.router)
app.include_router(content.router)
app.include_router(vehicles.router)
app.include_router(seo.router)
app.include_router(site_stats.router)
app.include_router(admin_auth.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_orders.router)
app.include_router(admin_reviews.router)
app.include_router(admin_installation.router)
app.include_router(admin_products.router)
app.include_router(admin_content.router)
app.include_router(admin_site_stats.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
