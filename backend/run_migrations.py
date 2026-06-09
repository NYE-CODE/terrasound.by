"""Применить схему БД и SQLite-миграции без запуска HTTP-сервера."""

from app.database import Base, engine
from app.migrations import run_migrations


def main() -> None:
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    print("Migrations OK")


if __name__ == "__main__":
    main()
