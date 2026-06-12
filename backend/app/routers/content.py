from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, load_only

from app.api_constants import API_V1_PREFIX
from app.cache import (
    CONTENT_BRANDS,
    CONTENT_CATEGORIES,
    category_filters_cache_key,
    content_cache,
)
from app.database import get_db
from app.models.content import BlogPost, Brand, Category, PortfolioWork
from app.schemas.attribute import CategoryFiltersOut
from app.schemas.content import (
    BlogPostCardOut,
    BlogPostDetailOut,
    BrandOut,
    CategoryOut,
    PortfolioWorkOut,
)
from app.schemas.pagination import PaginatedOut, paginated
from app.services.attributes import get_category_filters

router = APIRouter(prefix=API_V1_PREFIX, tags=["content"])

DEFAULT_LIST_LIMIT = 100
MAX_LIST_LIMIT = 500


@router.get("/categories", response_model=PaginatedOut[CategoryOut])
def list_categories(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[CategoryOut]:
    def load() -> list[dict]:
        items = (
            db.query(Category)
            .filter(Category.published.is_(True))
            .order_by(Category.sort_order, Category.name)
            .all()
        )
        return [CategoryOut.model_validate(item).model_dump(by_alias=True) for item in items]

    cached = content_cache.get(CONTENT_CATEGORIES, load)
    total = len(cached)
    page = cached[offset : offset + limit]
    data = [CategoryOut.model_validate(item) for item in page]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/categories/{category_id}/filters", response_model=CategoryFiltersOut)
def category_filters(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> CategoryFiltersOut:
    def load() -> dict:
        return get_category_filters(db, category_id).model_dump(by_alias=True)

    data = content_cache.get(category_filters_cache_key(category_id), load)
    return CategoryFiltersOut.model_validate(data)


@router.get("/brands", response_model=PaginatedOut[BrandOut])
def list_brands(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[BrandOut]:
    def load() -> list[dict]:
        items = (
            db.query(Brand)
            .filter(Brand.published.is_(True))
            .order_by(Brand.sort_order, Brand.name)
            .all()
        )
        return [BrandOut.model_validate(item).model_dump(by_alias=True) for item in items]

    cached = content_cache.get(CONTENT_BRANDS, load)
    total = len(cached)
    page = cached[offset : offset + limit]
    data = [BrandOut.model_validate(item) for item in page]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/blog-posts", response_model=PaginatedOut[BlogPostCardOut])
def list_blog_posts(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[BlogPostCardOut]:
    query = (
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
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    data = [BlogPostCardOut.model_validate(item) for item in items]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/blog-posts/{post_id}", response_model=BlogPostDetailOut)
def get_blog_post(post_id: str, db: Annotated[Session, Depends(get_db)]) -> BlogPostDetailOut:
    item = (
        db.query(BlogPost)
        .filter(BlogPost.id == post_id, BlogPost.published.is_(True))
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    return BlogPostDetailOut.model_validate(item)


@router.get("/portfolio-works", response_model=PaginatedOut[PortfolioWorkOut])
def list_portfolio_works(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[PortfolioWorkOut]:
    query = (
        db.query(PortfolioWork)
        .filter(PortfolioWork.published.is_(True))
        .order_by(PortfolioWork.sort_order, PortfolioWork.title)
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    data = [PortfolioWorkOut.model_validate(item) for item in items]
    return paginated(data, total=total, limit=limit, offset=offset)
