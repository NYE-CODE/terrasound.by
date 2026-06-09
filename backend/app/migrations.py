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
