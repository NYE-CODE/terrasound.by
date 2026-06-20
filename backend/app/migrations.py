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

    if "product_compatibility" in tables:
        with engine.begin() as conn:
            conn.execute(text("DROP TABLE product_compatibility"))

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
    _migrate_site_stats_enabled(engine)
    _migrate_admin_token_version(engine)
    _migrate_site_contact_telegram(engine)
    _migrate_site_contact_maps_url(engine)
    _migrate_site_contact_map_coordinates(engine)
    _migrate_site_contact_working_hours(engine)
    _migrate_site_announcement(engine)
    _migrate_site_announcement_scroll_duration(engine)
    _migrate_order_items_in_stock(engine)
    _migrate_site_legal_pages(engine)
    _migrate_products_featured_on_home(engine)


def _migrate_products_featured_on_home(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("products")}
    if "featured_on_home" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE products ADD COLUMN featured_on_home BOOLEAN NOT NULL DEFAULT 0"
                )
            )


def _migrate_order_items_in_stock(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "order_items" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("order_items")}
    if "in_stock" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE order_items ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT 1")
            )


def _migrate_site_announcement_scroll_duration(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_announcement" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_announcement")}
    if "scroll_duration_seconds" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE site_announcement ADD COLUMN scroll_duration_seconds "
                    "INTEGER NOT NULL DEFAULT 45"
                )
            )
    _migrate_product_highlights(engine)


def _migrate_product_highlights(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "product_highlights" in inspector.get_table_names():
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE product_highlights (
                    id INTEGER NOT NULL PRIMARY KEY,
                    highlights_json TEXT NOT NULL DEFAULT '[]'
                )
                """
            )
        )
        default_json = (
            '["Бесплатная консультация перед покупкой", '
            '"Гарантия 2 года на всё оборудование", '
            '"Доступна профессиональная установка"]'
        )
        conn.execute(
            text("INSERT INTO product_highlights (id, highlights_json) VALUES (1, :json)"),
            {"json": default_json},
        )


def _migrate_site_announcement(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_announcement" in inspector.get_table_names():
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE site_announcement (
                    id INTEGER NOT NULL PRIMARY KEY,
                    text VARCHAR(512) NOT NULL DEFAULT '',
                    enabled BOOLEAN NOT NULL DEFAULT 0,
                    scroll_duration_seconds INTEGER NOT NULL DEFAULT 45
                )
                """
            )
        )
        conn.execute(text("INSERT INTO site_announcement (id, text, enabled, scroll_duration_seconds) VALUES (1, '', 0, 45)"))


def _migrate_site_contact_working_hours(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_contact" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_contact")}
    if "working_hours" not in columns:
        default_hours = "Пн–Пт, 10:00–18:00, обед 14:00–15:00"
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE site_contact ADD COLUMN working_hours VARCHAR(256) NOT NULL DEFAULT ''")
            )
            conn.execute(
                text(
                    "UPDATE site_contact SET working_hours = :hours "
                    "WHERE id = 1 AND (working_hours IS NULL OR working_hours = '')"
                ),
                {"hours": default_hours},
            )


def _migrate_site_contact_maps_url(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    from app.contact_utils import address_to_maps_url

    inspector = inspect(engine)
    if "site_contact" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_contact")}
    if "maps_url" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE site_contact ADD COLUMN maps_url VARCHAR(1024) NOT NULL DEFAULT ''"))
            row = conn.execute(text("SELECT address FROM site_contact WHERE id = 1")).fetchone()
            if row and row[0]:
                conn.execute(
                    text("UPDATE site_contact SET maps_url = :url WHERE id = 1 AND maps_url = ''"),
                    {"url": address_to_maps_url(row[0])},
                )


def _migrate_site_contact_map_coordinates(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    from app.contact_utils import DEFAULT_MAP_LAT, DEFAULT_MAP_LON

    inspector = inspect(engine)
    if "site_contact" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_contact")}
    with engine.begin() as conn:
        if "map_lat" not in columns:
            conn.execute(text("ALTER TABLE site_contact ADD COLUMN map_lat REAL"))
        if "map_lon" not in columns:
            conn.execute(text("ALTER TABLE site_contact ADD COLUMN map_lon REAL"))
        conn.execute(
            text(
                "UPDATE site_contact SET map_lat = :lat, map_lon = :lon "
                "WHERE id = 1 AND map_lat IS NULL AND map_lon IS NULL"
            ),
            {"lat": DEFAULT_MAP_LAT, "lon": DEFAULT_MAP_LON},
        )


def _migrate_site_contact_telegram(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_contact" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_contact")}
    if "telegram_url" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE site_contact ADD COLUMN telegram_url VARCHAR(512) NOT NULL DEFAULT ''")
            )
            conn.execute(
                text(
                    "UPDATE site_contact SET telegram_url = :url "
                    "WHERE id = 1 AND (telegram_url IS NULL OR telegram_url = '')"
                ),
                {"url": "https://t.me/terrasound_by"},
            )


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


def _migrate_site_stats_enabled(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_stats" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("site_stats")}
    if "enabled" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE site_stats ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT 0")
            )


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


def _migrate_site_legal_pages(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "site_legal_pages" in inspector.get_table_names():
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE site_legal_pages (
                    slug VARCHAR(32) NOT NULL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL DEFAULT '',
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

