# Terrasound Backend

FastAPI + SQLAlchemy + SQLite API для terrasound.by.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
copy .env.example .env        # SECRET_KEY, ADMIN_PASSWORD
uvicorn app.main:app --reload --port 8000
```

- API docs (только `ENVIRONMENT=development`): http://localhost:8000/docs
- Health: http://localhost:8000/api/health

При старте приложения: `create_all` → `run_migrations()` → `seed_database()`.

Отдельно (например, при деплое): `python run_migrations.py`.

## Environment

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (default `sqlite:///./terrasound.db`) |
| `SECRET_KEY` | JWT signing key |
| `ADMIN_USERNAME` | Admin login |
| `ADMIN_PASSWORD` | Admin password |
| `CORS_ORIGINS` | Comma-separated frontend origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes |
| `ENVIRONMENT` | `development` — Swagger включён; `production` — `/docs` отключены |

## Структура

| Путь | Назначение |
|---|---|
| `app/routers/` | Публичные и admin HTTP-роуты |
| `app/services/` | Бизнес-логика, запросы к БД |
| `app/models/` | SQLAlchemy-модели |
| `app/schemas/` | Pydantic request/response |
| `app/migrations.py` | Индексы и ALTER для существующих SQLite-БД |
| `app/cache.py` | In-memory TTL-кэш |
| `app/rate_limit.py` | Middleware лимитов запросов |
| `app/seed.py` | Демо-данные при первом запуске |

## Ключевые эндпоинты

### Публичные

- `GET /api/products` — каталог `{ items, total }`, query: `category`, `brands`, `priceMin`, `priceMax`, `sort`, `limit`, `offset`
- `GET /api/products/{id}` — детальная карточка
- `GET /api/categories`, `/api/brands`, `/api/services`, `/api/blog`, `/api/team`
- `POST /api/orders` — заявка на заказ
- `POST /api/products/{id}/reviews` — отзыв (rate limit)
- `GET /api/site-stats` — статистика для главной (кэш 5 мин)

### Admin (JWT Bearer)

- `POST /api/admin/auth/login`
- CRUD: `/api/admin/products`, `/orders`, `/reviews`, `/categories`, `/brands`, `/blog`, `/services`, `/team`
- `PATCH /api/admin/site-stats`

## Миграции и индексы

Для SQLite в `migrations.py` выполняются:

- добавление колонок (`product_reviews.rating`, `products.sale_price`, `products.created_at`);
- индексы:
  - `ix_product_reviews_product_published (product_id, published)`
  - `ix_products_in_stock_category (in_stock, category)`
  - `ix_products_in_stock_brand (in_stock, brand)`

## Кэш

TTL 5 минут для:

- `GET /api/categories`, `/api/brands`, `/api/services`
- `GET /api/site-stats`

Инвалидация при изменениях через admin CRUD и `PATCH /api/admin/site-stats`.

## Безопасность

- Rate limiting: login, orders, reviews, installation requests
- Укороченные сообщения об ошибках 422/500 в production-режиме
- Публичный `GET /api/orders/{id}` отсутствует (защита от IDOR)
- `get_current_admin` проверяет JWT без запроса в БД на каждый вызов
