from __future__ import annotations

from typing import Literal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db_commit import commit_or_raise
from app.models.attribute import CategoryAttribute
from app.models.content import Category
from app.models.product import Product

CategoryDeleteStrategy = Literal["default", "cascade", "move"]


def delete_category(
    db: Session,
    item_id: str,
    *,
    strategy: CategoryDeleteStrategy = "default",
    move_to_category_id: str | None = None,
) -> None:
    item = db.query(Category).filter(Category.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    products = db.query(Product).filter(Product.category == item_id).all()
    product_count = len(products)

    if product_count > 0 and strategy == "default":
        raise HTTPException(
            status_code=409,
            detail=(
                f"Нельзя удалить категорию: в ней {product_count} товар(ов). "
                "Перенесите товары в другую категорию или удалите их."
            ),
        )

    if strategy == "move":
        if not move_to_category_id:
            raise HTTPException(status_code=400, detail="Укажите категорию для переноса товаров")
        if move_to_category_id == item_id:
            raise HTTPException(status_code=400, detail="Выберите другую категорию для переноса")
        target = db.query(Category).filter(Category.id == move_to_category_id).first()
        if not target:
            raise HTTPException(status_code=400, detail="Категория для переноса не найдена")
        for product in products:
            product.category = move_to_category_id
        db.flush()
    elif strategy == "cascade" and product_count > 0:
        for product in products:
            db.delete(product)
        db.flush()

    db.query(CategoryAttribute).filter(CategoryAttribute.category_id == item_id).delete()
    db.delete(item)
    commit_or_raise(db)
