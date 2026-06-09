"""Применить схему БД и SQLite-миграции без запуска HTTP-сервера."""

import app.models  # noqa: F401 — регистрация таблиц в Base.metadata
from app.database import Base, engine
from app.migrations import run_migrations


def main() -> None:
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    print("Migrations OK")


if __name__ == "__main__":
    main()
