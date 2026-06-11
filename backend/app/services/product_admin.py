import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.content import Category
from app.models.product import Product, ProductCompatibility, ProductImage, ProductSpec
from app.schemas.content import ProductAdminOut, ProductCreate, ProductUpdate
from app.services.attributes import (
    product_attributes_dict,
    sync_product_attributes,
    validate_and_normalize_attributes,
)


def product_to_admin_out(db: Session, product: Product) -> ProductAdminOut:
    images = [img.url for img in sorted(product.images, key=lambda i: i.sort_order)]
    if not images:
        images = [product.image_url]

    return ProductAdminOut(
        id=product.id,
        brand=product.brand,
        name=product.name,
        price=product.price,
        sale_price=product.sale_price,
        category=product.category,
        image_url=product.image_url,
        specs_short=product.specs_short,
        in_stock=product.in_stock,
        images=images,
        specs={spec.key: spec.value for spec in product.specs},
        attributes=product_attributes_dict(db, product.id),
        compatibility=[item.vehicle for item in product.compatibility],
    )


def _sync_images(db: Session, product: Product, urls: list[str]) -> None:
    for image in list(product.images):
        db.delete(image)
    for index, url in enumerate(urls):
        db.add(ProductImage(product_id=product.id, url=url, sort_order=index))


def _sync_specs(db: Session, product: Product, specs: dict[str, str]) -> None:
    for spec in list(product.specs):
        db.delete(spec)
    for key, value in specs.items():
        db.add(ProductSpec(product_id=product.id, key=key, value=value))


def _sync_compatibility(db: Session, product: Product, vehicles: list[str]) -> None:
    for item in list(product.compatibility):
        db.delete(item)
    for vehicle in vehicles:
        db.add(ProductCompatibility(product_id=product.id, vehicle=vehicle))


def _validate_sale_price(price: float, sale_price: float | None) -> None:
    if sale_price is not None and sale_price >= price:
        raise HTTPException(
            status_code=400,
            detail="Цена со скидкой должна быть меньше обычной цены",
        )


def _ensure_category_exists(db: Session, category_id: str) -> None:
    if not db.query(Category).filter(Category.id == category_id).first():
        raise HTTPException(status_code=400, detail="Категория не найдена")


def create_product(db: Session, payload: ProductCreate) -> Product:
    _ensure_category_exists(db, payload.category)
    _validate_sale_price(payload.price, payload.sale_price)
    product_id = str(uuid.uuid4())
    images = payload.images or [payload.image_url]

    product = Product(
        id=product_id,
        brand=payload.brand,
        name=payload.name,
        price=payload.price,
        sale_price=payload.sale_price,
        category=payload.category,
        image_url=payload.image_url,
        specs_short=payload.specs_short,
        in_stock=payload.in_stock,
    )
    db.add(product)
    db.flush()
    _sync_images(db, product, images)
    _sync_specs(db, product, payload.specs)
    normalized_attrs = validate_and_normalize_attributes(db, payload.category, payload.attributes)
    sync_product_attributes(db, product, normalized_attrs)
    _sync_compatibility(db, product, payload.compatibility)
    db.commit()
    return (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
            joinedload(Product.attribute_values),
        )
        .filter(Product.id == product_id)
        .one()
    )


def update_product(db: Session, product_id: str, payload: ProductUpdate) -> Product:
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
        raise HTTPException(status_code=404, detail="Товар не найден")

    data = payload.model_dump(exclude_unset=True)
    images = data.pop("images", None)
    specs = data.pop("specs", None)
    attributes = data.pop("attributes", None)
    compatibility = data.pop("compatibility", None)

    if "category" in data:
        _ensure_category_exists(db, data["category"])

    next_price = data.get("price", product.price)
    next_sale_price = data.get("sale_price", product.sale_price)
    _validate_sale_price(next_price, next_sale_price)

    for field, value in data.items():
        setattr(product, field, value)

    if images is not None:
        _sync_images(db, product, images)
    if specs is not None:
        _sync_specs(db, product, specs)
    if attributes is not None:
        category_id = data.get("category", product.category)
        normalized_attrs = validate_and_normalize_attributes(db, category_id, attributes)
        sync_product_attributes(db, product, normalized_attrs)
    if compatibility is not None:
        _sync_compatibility(db, product, compatibility)

    db.commit()
    return (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.specs),
            joinedload(Product.compatibility),
            joinedload(Product.attribute_values),
        )
        .filter(Product.id == product_id)
        .one()
    )


def delete_product(db: Session, product_id: str) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    db.delete(product)
    db.commit()
