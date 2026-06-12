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
        "CREATE INDEX IF NOT EXISTS ix_products_category_created_at "
        "ON products (category, created_at)",
        "CREATE INDEX IF NOT EXISTS ix_pav_attribute_number "
        "ON product_attribute_values (attribute_id, value_number)",
        "CREATE INDEX IF NOT EXISTS ix_pav_attribute_string "
        "ON product_attribute_values (attribute_id, value_string)",
        "CREATE INDEX IF NOT EXISTS ix_pav_product_id "
        "ON product_attribute_values (product_id)",
    ]
    with engine.begin() as conn:
        for statement in index_statements:
            conn.execute(text(statement))

    _migrate_catalog_categories(engine)
    _migrate_attributes_filter_type(engine)
    _migrate_site_stats_to_text(engine)
    _migrate_admin_token_version(engine)


def _migrate_admin_token_version(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "admin_accounts" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("admin_accounts")}
    if "token_version" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE admin_accounts ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1")
            )


def _migrate_site_stats_to_text(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_stats" not in inspector.get_table_names():
        return

    columns = {col["name"]: col for col in inspector.get_columns("site_stats")}
    if "installations_completed" not in columns:
        return

    col_type = str(columns["installations_completed"]["type"]).upper()
    if "INT" not in col_type:
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE site_stats_new (
                    id INTEGER NOT NULL PRIMARY KEY,
                    installations_completed VARCHAR(64) NOT NULL DEFAULT '1200+',
                    years_expertise VARCHAR(64) NOT NULL DEFAULT '8'
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO site_stats_new (id, installations_completed, years_expertise)
                SELECT id,
                       CAST(installations_completed AS TEXT) || '+',
                       CAST(years_expertise AS TEXT)
                FROM site_stats
                """
            )
        )
        conn.execute(text("DROP TABLE site_stats"))
        conn.execute(text("ALTER TABLE site_stats_new RENAME TO site_stats"))


def _migrate_attributes_filter_type(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "attributes" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("attributes")}
    if "filter_type" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE attributes ADD COLUMN filter_type VARCHAR(20)"))



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

        conn.execute(text("DELETE FROM categories WHERE id = 'subwoofers'"))
