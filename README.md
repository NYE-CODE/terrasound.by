# terrasound.by

Monorepo для платформы TerraSound — премиальный автозвук в Гродно: витрина, админка и API.

Сайт работает как **каталог с заявками на заказ** (не полноценный интернет-магазин с оплатой на сайте).

## Структура

```
terrasound.by/
├── frontend/          React + Vite — публичная витрина
├── admin/             React + Vite — панель администратора
├── backend/           FastAPI + SQLAlchemy + SQLite
└── packages/shared/   Общие TypeScript-типы домена
```

| Приложение | Порт (dev) | Описание |
|---|---|---|
| Backend API | 8000 | REST API, JWT для админки |
| Frontend | 5173 | Каталог, карточки товаров, оформление заявки |
| Admin | 5175 | Управление контентом, товарами, заказами, отзывами |

## Требования

- **Node.js** 18+ и **pnpm**
- **Python** 3.11+

## Быстрый старт

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
copy .env.example .env          # задайте SECRET_KEY и ADMIN_PASSWORD
uvicorn app.main:app --reload --port 8000
```

При первом запуске создаётся БД SQLite, применяются миграции и выполняется seed с демо-данными.

### 2. Зависимости фронтенда

Из корня репозитория:

```bash
pnpm install
```

### 3. Витрина

```bash
copy frontend\.env.example frontend\.env
pnpm --filter terrasound-frontend dev
```

http://localhost:5173

### 4. Админка

```bash
copy admin\.env.example admin\.env
pnpm --filter terrasound-admin dev
```

http://localhost:5175 — логин из `backend/.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

## Сборка production

```bash
# Backend — запуск через uvicorn/gunicorn с ENVIRONMENT=production
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Витрина (Vite build + prerender статических маршрутов)
pnpm --filter terrasound-frontend build

# Админка
pnpm --filter terrasound-admin build
```

## Деплой на сервер

Автоматический деплой: `./deploy/deploy.sh` (Linux).

```bash
cp deploy/deploy.env.example deploy/deploy.env   # пути, URL сборки, systemd
cp backend/.env.example backend/.env             # секреты API (не в git)
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

| Файл | Содержимое |
|---|---|
| `deploy/deploy.env` | `APP_DIR`, `GIT_BRANCH`, `VITE_API_URL`, `API_SERVICE`, nginx |
| `backend/.env` | `SECRET_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`, `ENVIRONMENT=production` |

Подробнее: [deploy/README.md](deploy/README.md) — systemd, nginx, опции `--skip-*`.

## API

- **Swagger (только dev):** http://localhost:8000/docs
- **Health:** http://localhost:8000/api/health

### Публичные эндпоинты (основные)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/products` | Каталог: `{ items, total }`, фильтры, сортировка, пагинация |
| GET | `/api/products/{id}` | Карточка товара |
| GET | `/api/categories` | Категории |
| GET | `/api/brands` | Бренды (контент) |
| GET | `/api/blog` | Список статей (без полного текста) |
| POST | `/api/orders` | Создание заявки на заказ |
| POST | `/api/products/{id}/reviews` | Отзыв о товаре (модерация) |
| GET | `/api/site-stats` | Статистика для главной |

### Каталог товаров

`GET /api/products` возвращает объект:

```json
{
  "items": [ /* ProductCard[] */ ],
  "total": 42
}
```

Query-параметры: `category`, `brands`, `priceMin`, `priceMax`, `sort` (`popularity`, `price-low`, `price-high`, `new`, `rating`), `limit`, `offset`.

### Админка

Все маршруты `/api/admin/*` требуют заголовок `Authorization: Bearer <token>` (получить через `POST /api/admin/auth/login`).

## Переменные окружения

### Backend (`backend/.env`)

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Путь к SQLite (по умолчанию `sqlite:///./terrasound.db`) |
| `SECRET_KEY` | Ключ подписи JWT |
| `ADMIN_USERNAME` | Логин администратора |
| `ADMIN_PASSWORD` | Пароль администратора |
| `CORS_ORIGINS` | Разрешённые origins через запятую |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни JWT |
| `ENVIRONMENT` | `development` или `production` (в production отключены `/docs`) |

### Frontend / Admin

| Переменная | Описание |
|---|---|
| `VITE_API_URL` | URL backend API (по умолчанию `http://localhost:8000`) |

## Общие типы

```ts
import type { Order, ProductReview, ServiceReview } from "@terrasound/shared";
```

Пакет `@terrasound/shared` подключается в `frontend` и `admin` через pnpm workspace.

## Backend: архитектура

```
backend/app/
├── routers/       HTTP-роуты (публичные и admin/*)
├── services/      Бизнес-логика и запросы к БД
├── models/        SQLAlchemy-модели
├── schemas/       Pydantic-схемы запросов/ответов
├── migrations.py  Индексы и ALTER для SQLite
└── cache.py       TTL-кэш для редко меняющегося контента
```

Подробнее о backend — в [backend/README.md](backend/README.md).

## Безопасность и производительность

- Rate limiting на login, заказы, отзывы и заявки на установку
- Публичные отзывы без email; модерация через поле `published`
- Агрегация рейтингов товаров в SQL (без N+1 по отзывам в каталоге)
- Индексы на `products(in_stock, category|brand)` и `product_reviews(product_id, published)`
- TTL-кэш (5 мин) для категорий, брендов, услуг и site-stats с инвалидацией из админки

## Лицензия

Proprietary — TerraSound, terrasound.by.
