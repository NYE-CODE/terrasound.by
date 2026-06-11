from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, load_only

from app.cache import (
    CONTENT_BRANDS,
    CONTENT_CATEGORIES,
    CONTENT_SERVICES,
    content_cache,
)
from app.database import get_db
from app.models.content import BlogPost, Brand, Category, InstallationService, PortfolioWork
from app.schemas.attribute import CategoryFiltersOut
from app.schemas.content import (
    BlogPostCardOut,
    BlogPostDetailOut,
    BrandOut,
    CategoryOut,
    InstallationServiceOut,
    PortfolioWorkOut,
)
from app.services.attributes import get_category_filters

router = APIRouter(prefix="/api", tags=["content"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Annotated[Session, Depends(get_db)]) -> list[CategoryOut]:
    def load() -> list[dict]:
        items = (
            db.query(Category)
            .filter(Category.published.is_(True))
            .order_by(Category.sort_order, Category.name)
            .all()
        )
        return [CategoryOut.model_validate(item).model_dump(by_alias=True) for item in items]

    data = content_cache.get(CONTENT_CATEGORIES, load)
    return [CategoryOut.model_validate(item) for item in data]


@router.get("/categories/{category_id}/filters", response_model=CategoryFiltersOut)
def category_filters(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> CategoryFiltersOut:
    return get_category_filters(db, category_id)


@router.get("/services", response_model=list[InstallationServiceOut])
def list_services(db: Annotated[Session, Depends(get_db)]) -> list[InstallationServiceOut]:
    def load() -> list[dict]:
        items = (
            db.query(InstallationService)
            .filter(InstallationService.published.is_(True))
            .order_by(InstallationService.sort_order, InstallationService.title)
            .all()
        )
        return [
            InstallationServiceOut.model_validate(item).model_dump(by_alias=True) for item in items
        ]

    data = content_cache.get(CONTENT_SERVICES, load)
    return [InstallationServiceOut.model_validate(item) for item in data]


@router.get("/brands", response_model=list[BrandOut])
def list_brands(db: Annotated[Session, Depends(get_db)]) -> list[BrandOut]:
    def load() -> list[dict]:
        items = (
            db.query(Brand)
            .filter(Brand.published.is_(True))
            .order_by(Brand.sort_order, Brand.name)
            .all()
        )
        return [BrandOut.model_validate(item).model_dump(by_alias=True) for item in items]

    data = content_cache.get(CONTENT_BRANDS, load)
    return [BrandOut.model_validate(item) for item in data]


@router.get("/blog", response_model=list[BlogPostCardOut])
def list_blog_posts(db: Annotated[Session, Depends(get_db)]) -> list[BlogPostCardOut]:
    items = (
        db.query(BlogPost)
        .options(
            load_only(
                BlogPost.id,
                BlogPost.title,
                BlogPost.excerpt,
                BlogPost.category,
                BlogPost.created_at,
            )
        )
        .filter(BlogPost.published.is_(True))
        .order_by(BlogPost.created_at.desc())
        .all()
    )
    return [BlogPostCardOut.model_validate(item) for item in items]


@router.get("/blog/{post_id}", response_model=BlogPostDetailOut)
def get_blog_post(post_id: str, db: Annotated[Session, Depends(get_db)]) -> BlogPostDetailOut:
    item = (
        db.query(BlogPost)
        .filter(BlogPost.id == post_id, BlogPost.published.is_(True))
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    return BlogPostDetailOut.model_validate(item)


@router.get("/portfolio", response_model=list[PortfolioWorkOut])
def list_portfolio_works(db: Annotated[Session, Depends(get_db)]) -> list[PortfolioWorkOut]:
    items = (
        db.query(PortfolioWork)
        .filter(PortfolioWork.published.is_(True))
        .order_by(PortfolioWork.sort_order, PortfolioWork.title)
        .all()
    )
    return [PortfolioWorkOut.model_validate(item) for item in items]
