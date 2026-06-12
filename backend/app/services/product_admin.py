import re
import uuid

from fastapi import HTTPException
from sqlalchemy import inspect
from sqlalchemy.orm import Session, joinedload

from app.cache import CATALOG_PRICE_BOUNDS, PRODUCT_BRANDS, content_cache, invalidate_category_filters_cache
from app.db_commit import commit_or_raise
from app.money import round_money

from app.models.content import Category
from app.models.product import Product, ProductCompatibility, ProductImage, ProductSpec
from app.schemas.content import ProductAdminOut, ProductCreate, ProductUpdate
from app.services.attributes import (
    clear_product_attribute_values,
    product_attributes_dict,
    product_attributes_dict_from_rows,
    sync_product_attributes,
    validate_and_normalize_attributes,
)


def _product_attributes_for_admin(db: Session, product: Product) -> dict:
    if "attribute_values" not in inspect(product).unloaded:
        return product_attributes_dict_from_rows(list(product.attribute_values))
    return product_attributes_dict(db, product.id)


def _invalidate_product_list_caches(*category_ids: str) -> None:
    content_cache.invalidate(PRODUCT_BRANDS)
    content_cache.invalidate(CATALOG_PRICE_BOUNDS)
    for category_id in category_ids:
        if category_id:
            invalidate_category_filters_cache(category_id)


def product_to_admin_out(db: Session, product: Product) -> ProductAdminOut:
    images = [img.url for img in sorted(product.images, key=lambda i: i.sort_order)]
    if not images:
        images = [product.image_url]

    return ProductAdminOut(
        id=product.id,
        brand=product.brand,
        name=product.name,
        price=round_money(product.price),
        sale_price=round_money(product.sale_price) if product.sale_price is not None else None,
        category=product.category,
        image_url=product.image_url,
        specs_short=product.specs_short,
        in_stock=product.in_stock,
        images=images,
        specs={spec.key: spec.value for spec in product.specs},
        attributes=_product_attributes_for_admin(db, product),
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


_COPY_SUFFIX_RE = re.compile(r" \(копия(?: \d+)?\)$")


def duplicate_product_name(name: str) -> str:
    base = _COPY_SUFFIX_RE.sub("", name).rstrip()
    return f"{base} (копия)"


def _load_product_for_admin(db: Session, product_id: str) -> Product:
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
    return product


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
    sync_product_attributes(db, product, normalized_attrs, replace_all=True)
    _sync_compatibility(db, product, payload.compatibility)
    commit_or_raise(db)
    _invalidate_product_list_caches(payload.category)
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
            joinedload(Product.attribute_values),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    previous_category = product.category
    data = payload.model_dump(exclude_unset=True)
    images = data.pop("images", None)
    specs = data.pop("specs", None)
    attributes = data.pop("attributes", None)
    compatibility = data.pop("compatibility", None)

    if "category" in data:
        _ensure_category_exists(db, data["category"])

    category_changed = "category" in data and data["category"] != previous_category

    next_price = data.get("price", product.price)
    next_sale_price = data.get("sale_price", product.sale_price)
    _validate_sale_price(next_price, next_sale_price)

    for field, value in data.items():
        setattr(product, field, value)

    if category_changed:
        clear_product_attribute_values(db, product.id)
        db.flush()

    if images is not None:
        _sync_images(db, product, images)
    if specs is not None:
        _sync_specs(db, product, specs)
    if attributes is not None:
        category_id = data.get("category", product.category)
        normalized_attrs = validate_and_normalize_attributes(
            db,
            category_id,
            attributes,
            product_id=product.id,
        )
        sync_product_attributes(db, product, normalized_attrs)
    if compatibility is not None:
        _sync_compatibility(db, product, compatibility)

    commit_or_raise(db)
    next_category = data.get("category", previous_category)
    _invalidate_product_list_caches(previous_category, next_category)
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


def duplicate_product(db: Session, product_id: str) -> Product:
    source = _load_product_for_admin(db, product_id)
    admin = product_to_admin_out(db, source)
    payload = ProductCreate(
        brand=admin.brand,
        name=duplicate_product_name(admin.name),
        price=admin.price,
        sale_price=admin.sale_price,
        category=admin.category,
        image_url=admin.image_url,
        specs_short=admin.specs_short,
        in_stock=admin.in_stock,
        images=admin.images,
        specs=admin.specs,
        attributes=admin.attributes,
        compatibility=admin.compatibility,
    )
    return create_product(db, payload)


def delete_product(db: Session, product_id: str) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    category_id = product.category
    db.delete(product)
    commit_or_raise(db)
    _invalidate_product_list_caches(category_id)
