from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.api_constants import ADMIN_V2_PREFIX
from app.database import get_db
from app.models.product import Product
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.content import ProductAdminOut, ProductCreate, ProductUpdate
from app.schemas.pagination import PaginatedOut, paginated
from app.services.admin_products_list import (
    ProductListFilters,
    count_products,
    export_products_csv,
    list_products,
)
from app.services.product_admin import (
    create_product,
    delete_product,
    duplicate_product,
    product_to_admin_out,
    update_product,
)

router = APIRouter(
    prefix=f"{ADMIN_V2_PREFIX}/products",
    tags=["admin-products"],
    dependencies=ADMIN_ROUTER_DEPENDENCIES,
)


@router.get("/export")
def export_products_admin_v2(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None, max_length=50),
    brand: str | None = Query(default=None, max_length=100),
    in_stock: bool | None = Query(default=None, alias="inStock"),
) -> Response:
    filters = ProductListFilters(q=q, category=category, brand=brand, in_stock=in_stock)
    content, _count = export_products_csv(db, filters)
    filename = f"products-{date.today().isoformat()}.csv"
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", response_model=PaginatedOut[ProductAdminOut])
def list_products_admin_v2(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None, max_length=50),
    brand: str | None = Query(default=None, max_length=100),
    in_stock: bool | None = Query(default=None, alias="inStock"),
) -> PaginatedOut[ProductAdminOut]:
    filters = ProductListFilters(
        q=q,
        category=category,
        brand=brand,
        in_stock=in_stock,
    )
    total = count_products(db, filters)
    products = list_products(db, filters, limit=limit, offset=offset)
    data = [product_to_admin_out(db, product) for product in products]
    return paginated(data, total=total, limit=limit, offset=offset)


@router.get("/{product_id}", response_model=ProductAdminOut)
def get_product_admin_v2(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductAdminOut:
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
            joinedload(Product.attribute_values),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product_to_admin_out(db, product)


@router.post("", response_model=ProductAdminOut, status_code=201)
def create_product_admin_v2(
    payload: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductAdminOut:
    product = create_product(db, payload)
    return product_to_admin_out(db, product)


@router.post("/{product_id}/duplicate", response_model=ProductAdminOut, status_code=201)
def duplicate_product_admin_v2(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> ProductAdminOut:
    product = duplicate_product(db, product_id)
    return product_to_admin_out(db, product)


@router.patch("/{product_id}", response_model=ProductAdminOut)
def update_product_admin_v2(
    product_id: str,
    payload: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ProductAdminOut:
    product = update_product(db, product_id, payload)
    return product_to_admin_out(db, product)


@router.delete("/{product_id}", status_code=204)
def delete_product_admin_v2(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    delete_product(db, product_id)
