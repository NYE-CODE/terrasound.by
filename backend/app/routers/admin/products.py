from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_admin
from app.database import get_db
from app.models.product import Product
from app.schemas.auth import AdminUser
from app.schemas.content import ProductAdminOut, ProductCreate, ProductUpdate
from app.services.product_admin import create_product, delete_product, product_to_admin_out, update_product

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])


@router.get("", response_model=list[ProductAdminOut])
def list_products_admin(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[ProductAdminOut]:
    products = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
        )
        .order_by(Product.name)
        .all()
    )
    return [product_to_admin_out(product) for product in products]


@router.get("/{product_id}", response_model=ProductAdminOut)
def get_product_admin(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> ProductAdminOut:
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Товар не найден")
    return product_to_admin_out(product)


@router.post("", response_model=ProductAdminOut, status_code=201)
def create_product_admin(
    payload: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> ProductAdminOut:
    product = create_product(db, payload)
    return product_to_admin_out(product)


@router.patch("/{product_id}", response_model=ProductAdminOut)
def update_product_admin(
    product_id: str,
    payload: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> ProductAdminOut:
    product = update_product(db, product_id, payload)
    return product_to_admin_out(product)


@router.delete("/{product_id}", status_code=204)
def delete_product_admin(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> None:
    delete_product(db, product_id)
