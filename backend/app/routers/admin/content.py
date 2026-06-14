import uuid
from datetime import datetime
from typing import Annotated

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.pagination import PaginatedOut, paginated
from app.db_commit import commit_or_raise
from app.cache import CONTENT_BRANDS, CONTENT_CATEGORIES, CONTENT_SERVICES, content_cache
from app.database import get_db
from app.models.content import BlogPost, Brand, Category, InstallationService, PortfolioWork
from app.models.product import Product
from app.services.category_admin import cleanup_category_image_update, delete_category as delete_category_record
from app.services.media import (
    cleanup_portfolio_image_update,
    delete_portfolio_media,
    finalize_portfolio_media,
)
from app.schemas.content import (
    BlogPostCreate,
    BlogPostOut,
    BlogPostUpdate,
    BrandCreate,
    BrandOut,
    BrandUpdate,
    InstallationServiceCreate,
    InstallationServiceOut,
    InstallationServiceUpdate,
    CategoryAdminOut,
    CategoryCreate,
    CategoryUpdate,
    PortfolioWorkAdminOut,
    PortfolioWorkCreate,
    PortfolioWorkUpdate,
)

router = APIRouter(prefix=ADMIN_V1_PREFIX, tags=["admin-content"], dependencies=ADMIN_ROUTER_DEPENDENCIES)

DEFAULT_LIST_LIMIT = 200
MAX_LIST_LIMIT = 500


def _apply_updates(instance: object, payload: object) -> None:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(instance, field, value)


@router.get("/services", response_model=list[InstallationServiceOut])
def list_services_admin(
    db: Annotated[Session, Depends(get_db)],
) -> list[InstallationServiceOut]:
    items = db.query(InstallationService).order_by(InstallationService.sort_order).all()
    return [InstallationServiceOut.model_validate(item) for item in items]


@router.post("/services", response_model=InstallationServiceOut, status_code=201)
def create_service_admin(
    payload: InstallationServiceCreate,
    db: Annotated[Session, Depends(get_db)],
) -> InstallationServiceOut:
    item = InstallationService(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item)
    commit_or_raise(db)
    db.refresh(item)
    content_cache.invalidate(CONTENT_SERVICES)
    return InstallationServiceOut.model_validate(item)


@router.patch("/services/{item_id}", response_model=InstallationServiceOut)
def update_service_admin(
    item_id: str,
    payload: InstallationServiceUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> InstallationServiceOut:
    item = db.query(InstallationService).filter(InstallationService.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    _apply_updates(item, payload)
    commit_or_raise(db)
    db.refresh(item)
    content_cache.invalidate(CONTENT_SERVICES)
    return InstallationServiceOut.model_validate(item)


@router.delete("/services/{item_id}", status_code=204)
def delete_service_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(InstallationService).filter(InstallationService.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    db.delete(item)
    commit_or_raise(db)
    content_cache.invalidate(CONTENT_SERVICES)


@router.get("/brands", response_model=list[BrandOut])
def list_brands_admin(
    db: Annotated[Session, Depends(get_db)],
) -> list[BrandOut]:
    items = db.query(Brand).order_by(Brand.sort_order, Brand.name).all()
    return [BrandOut.model_validate(item) for item in items]


@router.post("/brands", response_model=BrandOut, status_code=201)
def create_brand_admin(
    payload: BrandCreate,
    db: Annotated[Session, Depends(get_db)],
) -> BrandOut:
    item = Brand(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item)
    commit_or_raise(db)
    db.refresh(item)
    content_cache.invalidate(CONTENT_BRANDS)
    return BrandOut.model_validate(item)


@router.patch("/brands/{item_id}", response_model=BrandOut)
def update_brand_admin(
    item_id: str,
    payload: BrandUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> BrandOut:
    item = db.query(Brand).filter(Brand.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Бренд не найден")
    _apply_updates(item, payload)
    commit_or_raise(db)
    db.refresh(item)
    content_cache.invalidate(CONTENT_BRANDS)
    return BrandOut.model_validate(item)


@router.delete("/brands/{item_id}", status_code=204)
def delete_brand_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(Brand).filter(Brand.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Бренд не найден")
    db.delete(item)
    commit_or_raise(db)
    content_cache.invalidate(CONTENT_BRANDS)


@router.get("/blog-posts", response_model=list[BlogPostOut])
def list_blog_admin(
    db: Annotated[Session, Depends(get_db)],
) -> list[BlogPostOut]:
    items = db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()
    return [BlogPostOut.model_validate(item) for item in items]


@router.post("/blog-posts", response_model=BlogPostOut, status_code=201)
def create_blog_admin(
    payload: BlogPostCreate,
    db: Annotated[Session, Depends(get_db)],
) -> BlogPostOut:
    item = BlogPost(id=str(uuid.uuid4()), created_at=datetime.utcnow(), **payload.model_dump())
    db.add(item)
    commit_or_raise(db)
    db.refresh(item)
    return BlogPostOut.model_validate(item)


@router.patch("/blog-posts/{item_id}", response_model=BlogPostOut)
def update_blog_admin(
    item_id: str,
    payload: BlogPostUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> BlogPostOut:
    item = db.query(BlogPost).filter(BlogPost.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    _apply_updates(item, payload)
    commit_or_raise(db)
    db.refresh(item)
    return BlogPostOut.model_validate(item)


@router.delete("/blog-posts/{item_id}", status_code=204)
def delete_blog_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(BlogPost).filter(BlogPost.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    db.delete(item)
    commit_or_raise(db)


def _product_counts_by_category(db: Session) -> dict[str, int]:
    rows = (
        db.query(Product.category, func.count(Product.id))
        .group_by(Product.category)
        .all()
    )
    return {category_id: count for category_id, count in rows}


def _category_admin_out(category: Category, product_count: int) -> CategoryAdminOut:
    return CategoryAdminOut(
        id=category.id,
        name=category.name,
        image_url=category.image_url,
        sort_order=category.sort_order,
        grid_cols=category.grid_cols,
        grid_tall=category.grid_tall,
        published=category.published,
        product_count=product_count,
    )


@router.get("/categories", response_model=list[CategoryAdminOut])
def list_categories_admin(
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryAdminOut]:
    items = db.query(Category).order_by(Category.sort_order, Category.name).all()
    counts = _product_counts_by_category(db)
    return [_category_admin_out(item, counts.get(item.id, 0)) for item in items]


@router.get("/categories/{item_id}", response_model=CategoryAdminOut)
def get_category_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> CategoryAdminOut:
    item = db.query(Category).filter(Category.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    count = db.query(Product).filter(Product.category == item_id).count()
    return _category_admin_out(item, count)


@router.post("/categories", response_model=CategoryAdminOut, status_code=201)
def create_category_admin(
    payload: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
) -> CategoryAdminOut:
    if db.query(Category).filter(Category.id == payload.id).first():
        raise HTTPException(status_code=409, detail="Категория с таким slug уже существует")
    item = Category(**payload.model_dump())
    db.add(item)
    commit_or_raise(db)
    db.refresh(item)
    content_cache.invalidate(CONTENT_CATEGORIES)
    return _category_admin_out(item, 0)


@router.patch("/categories/{item_id}", response_model=CategoryAdminOut)
def update_category_admin(
    item_id: str,
    payload: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> CategoryAdminOut:
    item = db.query(Category).filter(Category.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    old_image_url = item.image_url
    _apply_updates(item, payload)
    commit_or_raise(db)
    db.refresh(item)
    cleanup_category_image_update(old_image_url, item.image_url)
    count = db.query(Product).filter(Product.category == item_id).count()
    content_cache.invalidate(CONTENT_CATEGORIES)
    return _category_admin_out(item, count)


@router.delete("/categories/{item_id}", status_code=204)
def delete_category_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
    strategy: Literal["default", "cascade", "move"] = Query("default"),
    move_to_category_id: str | None = Query(None, alias="moveTo"),
) -> None:
    delete_category_record(
        db,
        item_id,
        strategy=strategy,
        move_to_category_id=move_to_category_id,
    )
    content_cache.invalidate(CONTENT_CATEGORIES)


@router.get("/portfolio-works", response_model=list[PortfolioWorkAdminOut])
def list_portfolio_admin(
    db: Annotated[Session, Depends(get_db)],
) -> list[PortfolioWorkAdminOut]:
    items = db.query(PortfolioWork).order_by(PortfolioWork.sort_order, PortfolioWork.title).all()
    return [PortfolioWorkAdminOut.model_validate(item) for item in items]


@router.post("/portfolio-works", response_model=PortfolioWorkAdminOut, status_code=201)
def create_portfolio_work_admin(
    payload: PortfolioWorkCreate,
    db: Annotated[Session, Depends(get_db)],
) -> PortfolioWorkAdminOut:
    work_id = str(uuid.uuid4())
    item = PortfolioWork(
        id=work_id,
        title=payload.title,
        image_url=finalize_portfolio_media(work_id, payload.image_url),
        sort_order=payload.sort_order,
        published=payload.published,
    )
    db.add(item)
    commit_or_raise(db)
    db.refresh(item)
    return PortfolioWorkAdminOut.model_validate(item)


@router.patch("/portfolio-works/{item_id}", response_model=PortfolioWorkAdminOut)
def update_portfolio_work_admin(
    item_id: str,
    payload: PortfolioWorkUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> PortfolioWorkAdminOut:
    item = db.query(PortfolioWork).filter(PortfolioWork.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    old_image_url = item.image_url
    _apply_updates(item, payload)
    if "image_url" in payload.model_dump(exclude_unset=True):
        item.image_url = finalize_portfolio_media(item.id, item.image_url)
    commit_or_raise(db)
    db.refresh(item)
    cleanup_portfolio_image_update(old_image_url, item.image_url)
    return PortfolioWorkAdminOut.model_validate(item)


@router.delete("/portfolio-works/{item_id}", status_code=204)
def delete_portfolio_work_admin(
    item_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    item = db.query(PortfolioWork).filter(PortfolioWork.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    image_url = item.image_url
    db.delete(item)
    commit_or_raise(db)
    delete_portfolio_media(image_url, item_id)
