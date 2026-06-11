from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def run_migrations(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    if "product_reviews" in tables:
        columns = {col["name"] for col in inspector.get_columns("product_reviews")}
        if "rating" not in columns:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE product_reviews ADD COLUMN rating INTEGER NOT NULL DEFAULT 5"
                    )
                )

    if "products" in tables:
        product_columns = {col["name"] for col in inspector.get_columns("products")}
        if "sale_price" not in product_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE products ADD COLUMN sale_price FLOAT"))

        if "created_at" not in product_columns:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE products ADD COLUMN created_at DATETIME "
                        "DEFAULT CURRENT_TIMESTAMP"
                    )
                )

    if "team_members" in tables:
        with engine.begin() as conn:
            conn.execute(text("DROP TABLE team_members"))

    if "orders" in tables:
        order_columns = {col["name"] for col in inspector.get_columns("orders")}
        if "installation_consultation_requested" in order_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE orders DROP COLUMN installation_consultation_requested"))

    if "installation_services" in tables:
        service_columns = {col["name"] for col in inspector.get_columns("installation_services")}
        if "price_range" in service_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE installation_services DROP COLUMN price_range"))

    if "product_reviews" not in tables or "products" not in tables:
        return

    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_product_reviews_product_published "
        "ON product_reviews (product_id, published)",
        "CREATE INDEX IF NOT EXISTS ix_products_in_stock_category "
        "ON products (in_stock, category)",
        "CREATE INDEX IF NOT EXISTS ix_products_in_stock_brand "
        "ON products (in_stock, brand)",
    ]
    with engine.begin() as conn:
        for statement in index_statements:
            conn.execute(text(statement))

    _migrate_catalog_categories(engine)


def _migrate_catalog_categories(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "categories" not in tables:
        return

    renames = [
        ("head-units", "sources", "Источники"),
        ("accessories", "wiring", "Проводка и сопутствующие"),
    ]
    has_category_attributes = "category_attributes" in tables

    with engine.begin() as conn:
        conn.execute(text("UPDATE products SET category = 'speakers' WHERE category = 'subwoofers'"))

        for old_id, new_id, new_name in renames:
            exists_old = conn.execute(
                text("SELECT 1 FROM categories WHERE id = :id"), {"id": old_id}
            ).fetchone()
            exists_new = conn.execute(
                text("SELECT 1 FROM categories WHERE id = :id"), {"id": new_id}
            ).fetchone()

            if exists_old and not exists_new:
                conn.execute(
                    text(
                        "INSERT INTO categories (id, name, image_url, sort_order, grid_cols, grid_tall, published) "
                        "SELECT :new_id, :new_name, image_url, sort_order, grid_cols, grid_tall, published "
                        "FROM categories WHERE id = :old_id"
                    ),
                    {"new_id": new_id, "new_name": new_name, "old_id": old_id},
                )
            elif exists_new:
                conn.execute(
                    text("UPDATE categories SET name = :name WHERE id = :id"),
                    {"name": new_name, "id": new_id},
                )

            conn.execute(
                text("UPDATE products SET category = :new WHERE category = :old"),
                {"new": new_id, "old": old_id},
            )
            if has_category_attributes:
                conn.execute(
                    text("UPDATE category_attributes SET category_id = :new WHERE category_id = :old"),
                    {"new": new_id, "old": old_id},
                )

            if exists_old:
                conn.execute(text("DELETE FROM categories WHERE id = :old"), {"old": old_id})

        conn.execute(text("UPDATE categories SET name = 'Динамики' WHERE id = 'speakers'"))

        processors = conn.execute(
            text("SELECT 1 FROM categories WHERE id = 'processors'")
        ).fetchone()
        if not processors:
            conn.execute(
                text(
                    "INSERT INTO categories (id, name, image_url, sort_order, grid_cols, grid_tall, published) "
                    "VALUES ('processors', 'Процессоры', "
                    "'https://images.unsplash.com/photo-1545226685-5e8a2f1d1b8e?w=800&q=80', "
                    "2, 1, 0, 1)"
                )
            )

        conn.execute(text("DELETE FROM categories WHERE id = 'subwoofers'"))
