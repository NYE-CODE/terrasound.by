# RFC: REST API v2 — унификация URL, контрактов и deprecation v1

| Поле | Значение |
|------|----------|
| **Статус** | Implemented (T0 — v2 live, v1 deprecated) |
| **Дата** | 2026-06-12 |
| **Область** | Backend (`/api/v1` → `/api/v2`), frontend, admin |
| **Автор** | TerraSound team |

## 1. Цели

1. Устранить дублирующие и путающие URL (`brands`, site-singletons, `installation/services`).
2. Согласовать формат списков (везде `PaginatedOut`) и datetime (RFC 3339 UTC с `Z`).
3. Вынести action-oriented эндпоинты (upload, duplicate) в sub-resources.
4. Ввести `/api/v2` с явной политикой deprecation для `/api/v1`.

## 2. Не-цели (v2)

- GraphQL, HATEOAS, cursor-based pagination.
- Публичный GET заказов по id (без auth).
- Hard-delete → soft-delete для orders (отложено в v2.1).

## 3. Принципы v2

| Принцип | Правило |
|---------|---------|
| Коллекции | Множественное число, kebab-case: `/products`, `/blog-posts` |
| Singleton | `/site/settings/{section}` вместо `/site-stats`, `/site-contact`, … |
| Facets | Агрегации каталога под `/products/facets`, не отдельный `/catalog/*` |
| Sub-resources | Upload: `POST /{resource}/{id}/images` |
| Списки | `{ data: T[], meta: { total, limit, offset } }` — всегда |
| Datetime | `serialize_utc_datetime()` → `"2026-06-12T10:00:00Z"` |
| Ошибки | Без изменений (Problem Details) |
| Admin | Префикс `/api/v2/admin`, те же правила |

## 4. Deprecation policy

### Заголовки ответа (v1, после релиза v2)

```
Deprecation: true
Sunset: Sat, 01 Mar 2027 00:00:00 GMT
Link: </api/v2/...>; rel="successor-version"
```

### Фазы

| Фаза | Срок | Действие |
|------|------|----------|
| **T0** | Релиз v2 | v1 + v2 параллельно; v1 с заголовками Deprecation |
| **T1** | +3 мес | Frontend и admin полностью на v2 |
| **T2** | +6 мес | v1 только для внешних клиентов (если есть) |
| **T3** | 2027-03-01 | v1 отключён, 410 Gone + `{ detail, successor: "/api/v2/..." }` |

### Health и SEO (исключения)

| URL | Решение |
|-----|---------|
| `GET /api/health` | Deprecated → `GET /api/v2/health` |
| `GET /api/v1/health` | Alias до T3 |
| `GET /sitemap.xml` | **Не API**, остаётся на корне сайта |

---

## 5. Mapping: публичное API

### 5.1. Без изменения URL (только контракт / поведение)

| v1 | v2 | Изменение |
|----|-----|-----------|
| `GET /api/v1/products` | `GET /api/v2/products` | Без breaking; datetime через единый serializer |
| `GET /api/v1/products/{id}` | `GET /api/v2/products/{id}` | — |
| `GET /api/v1/products/{id}/reviews` | `GET /api/v2/products/{id}/reviews` | — |
| `POST /api/v1/products/{id}/reviews` | `POST /api/v2/products/{id}/reviews` | — |
| `GET /api/v1/categories` | `GET /api/v2/categories` | — |
| `GET /api/v1/categories/{id}/filters` | `GET /api/v2/categories/{id}/filters` | — |
| `GET /api/v1/blog-posts` | `GET /api/v2/blog-posts` | — |
| `GET /api/v1/blog-posts/{id}` | `GET /api/v2/blog-posts/{id}` | — |
| `GET /api/v1/portfolio-works` | `GET /api/v2/portfolio-works` | — |
| `GET /api/v1/brands` | `GET /api/v2/brands` | — |
| `GET /api/v1/vehicles` | `GET /api/v2/vehicles` | — |
| `POST /api/v1/orders` | `POST /api/v2/orders` | **Breaking:** ответ `OrderCreatedOut` (см. §7) |
| `POST /api/v1/installation/requests` | `POST /api/v2/installation-requests` | Переименование URL |

### 5.2. Объединение / перенос URL

| v1 (deprecated) | v2 (canonical) | Причина |
|-----------------|----------------|---------|
| `GET /api/v1/catalog/brands` | `GET /api/v2/products/facets/brands` | Строки брендов из каталога — facet, не content-brands |
| `GET /api/v1/catalog/price-bounds` | `GET /api/v2/products/facets/price-bounds` | Facet каталога |
| `GET /api/v1/installation/services` | `GET /api/v2/installation-services` | Plural + единый ресурс с admin |
| `GET /api/v1/service-reviews` | `GET /api/v2/service-reviews` | Префикс v2; URL сохранён |
| `GET /api/v1/site-stats` | `GET /api/v2/site/settings/stats` | Singleton |
| `GET /api/v1/site-contact` | `GET /api/v2/site/settings/contact` | Singleton |
| `GET /api/v1/site-announcement` | `GET /api/v2/site/settings/announcement` | Singleton |
| `GET /api/v1/product-highlights` | `GET /api/v2/site/settings/product-highlights` | Singleton |
| `GET /api/v1/health` | `GET /api/v2/health` | Версионирование |

**Альтернатива site settings (одним запросом):**

```
GET /api/v2/site/settings
→ {
    stats: { installationsCompleted, yearsExpertise },
    contact: { ... },
    announcement: { text, enabled },
    productHighlights: { highlights: string[] }
  }
```

Рекомендация: **секции** (`/settings/{section}`) для PATCH по отдельности + опциональный aggregate GET для SSR bootstrap.

---

## 6. Mapping: admin API

### 6.1. Без изменения структуры URL

| v1 | v2 | Изменение |
|----|-----|-----------|
| `POST /api/v1/admin/sessions` | `POST /api/v2/admin/sessions` | — |
| `PATCH /api/v1/admin/me/password` | `PATCH /api/v2/admin/me/password` | Ответ: `204` вместо `{ message }` |
| `GET /api/v1/admin/dashboard` | `GET /api/v2/admin/dashboard` | — |
| CRUD `/admin/products`, `/orders`, `/attributes`, … | То же под `/api/v2/admin/...` | Списки → `PaginatedOut` (§7) |

### 6.2. Переименование / объединение

| v1 (deprecated) | v2 (canonical) | Причина |
|-----------------|----------------|---------|
| `GET /api/v1/admin/services` | `GET /api/v2/admin/installation-services` | Симметрия с публичным API |
| `POST/PATCH/DELETE .../services/{id}` | `.../installation-services/{id}` | — |
| `GET/PATCH /admin/site-stats` | `GET/PATCH /admin/site/settings/stats` | Singleton |
| `GET/PATCH /admin/site-contact` | `GET/PATCH /admin/site/settings/contact` | — |
| `GET/PATCH /admin/site-announcement` | `GET/PATCH /admin/site/settings/announcement` | — |
| `GET/PATCH /admin/product-highlights` | `GET/PATCH /admin/site/settings/product-highlights` | — |
| `GET /admin/brands` (массив) | `GET /admin/brands?limit&offset` → `PaginatedOut` | Единый контракт |
| `GET /admin/categories` (массив) | `GET /admin/categories?limit&offset` | — |
| `GET /admin/blog-posts` (массив) | `GET /admin/blog-posts?limit&offset` | — |
| `GET /admin/portfolio-works` (массив) | `GET /admin/portfolio-works?limit&offset` | — |
| `GET /admin/installation-requests` | `GET /admin/installation-requests` | URL сохранён |

### 6.3. Sub-resources (breaking для admin)

| v1 | v2 |
|----|-----|
| `POST /admin/products` + `{ sourceId }` | `POST /admin/products/{productId}/duplicate` → `201` + `ProductAdminOut` |
| `POST /admin/uploads/categories?categoryId=` | `POST /admin/categories/{categoryId}/images` → `{ data: { url } }` |
| `POST /admin/uploads/products?productId=` | `POST /admin/products/{productId}/images` |
| `POST /admin/uploads/portfolio?portfolioId=` | `POST /admin/portfolio-works/{portfolioId}/images` |
| `POST /admin/uploads/products` (без id) | `POST /admin/products/images` (временный upload, `productId` optional) |

---

## 7. Изменения контрактов (breaking)

### 7.1. Admin-списки → PaginatedOut

**Было (v1):**
```json
[{ "id": "...", "name": "..." }, ...]
```

**Стало (v2):**
```json
{
  "data": [{ "id": "...", "name": "..." }],
  "meta": { "total": 42, "limit": 200, "offset": 0 }
}
```

Затронутые эндпоинты: `GET /admin/brands`, `/categories`, `/blog-posts`, `/portfolio-works`, `/services` → `/installation-services`.

**Миграция admin:** `response.data` вместо `response`.

### 7.2. POST /orders — урезанный ответ

**Было (v1):** полный `OrderOut` (контакт, адрес, items, …).

**Стало (v2):**
```json
{
  "id": "uuid",
  "status": "new",
  "total": 1234.56,
  "createdAt": "2026-06-12T10:00:00Z"
}
```

Полный заказ — только admin: `GET /admin/orders/{id}`.

**Миграция frontend:** `CheckoutPage` / `OrderSuccessPage` — использовать `id`, `total`, `createdAt`.

### 7.3. Upload response

**Было:** `{ "url": "/uploads/..." }`

**Стало:** `{ "data": { "url": "/uploads/..." } }`

### 7.4. Datetime (non-breaking для клиентов, внутренняя унификация)

Все поля `*At` / `created_at` → `"YYYY-MM-DDTHH:mm:ssZ"` через `serialize_utc_datetime()`.

### 7.5. PATCH /admin/me/password

**Было:** `200` + `{ "message": "Пароль обновлён" }`

**Стало:** `204 No Content`

---

## 8. Единые defaults пагинации (v2)

| Ресурс | `limit` default | max |
|--------|-----------------|-----|
| products (public) | 50 | 100 |
| categories, brands, blog, portfolio | 100 | 500 |
| reviews | 50 | 100 |
| admin lists | 100 | 500 |
| admin orders, installation-requests | 50 | 200 |

---

## 9. План внедрения

### Этап 1 — Non-breaking (можно в v1.x)

- [ ] Единый `serialize_utc_datetime` во всех schemas
- [ ] Deprecation-заголовки на v1 (middleware)
- [ ] OpenAPI `/docs` для v1 и v2

### Этап 2 — v2 backend

- [ ] `API_V2_PREFIX = "/api/v2"` + роутеры (можно re-use services)
- [ ] `/products/facets/*`, `/installation-services`, `/site/settings/*`
- [ ] Admin PaginatedOut для content lists
- [ ] Sub-resources: duplicate, images

### Этап 3 — Клиенты

- [ ] `frontend/src/lib/api.ts` → `API_V2` + новые paths
- [ ] `admin/src/lib/api.ts` → PaginatedOut, uploads, site/settings
- [ ] E2E smoke: каталог, checkout, admin CRUD

### Этап 4 — T3

- [ ] Отключить v1 routers
- [ ] Nginx: 410 для `/api/v1/*` (кроме redirect doc)

---

## 10. Чеклист миграции frontend

| Файл / вызов | v1 | v2 |
|--------------|-----|-----|
| `getProductBrands()` | `/catalog/brands` | `/products/facets/brands` |
| `getCatalogPriceBounds()` | `/catalog/price-bounds` | `/products/facets/price-bounds` |
| `getInstallationServices()` | `/installation/services` | `/installation-services` |
| `createInstallationRequest()` | `/installation/requests` | `/installation-requests` |
| `getSiteStats()` | `/site-stats` | `/site/settings/stats` |
| `getSiteContact()` | `/site-contact` | `/site/settings/contact` |
| `getSiteAnnouncement()` | `/site-announcement` | `/site/settings/announcement` |
| `getProductHighlights()` | `/product-highlights` | `/site/settings/product-highlights` |
| `submitOrder()` | полный `OrderOut` | `OrderCreatedOut` |

**Опционально (SSR):** один `GET /site/settings` при загрузке layout вместо 4 запросов.

---

## 11. Чеклист миграции admin

| Вызов | Изменение |
|-------|-----------|
| `api.brands(token)` | `.data` из PaginatedOut |
| `api.categories(token)` | `.data` |
| `api.services(token)` | URL → `installation-services`, `.data` |
| `api.siteStats` / `updateSiteStats` | `/site/settings/stats` |
| `api.siteContact` | `/site/settings/contact` |
| `api.siteAnnouncement` | `/site/settings/announcement` |
| `api.productHighlights` | `/site/settings/product-highlights` |
| `api.duplicateProduct` | `POST .../products/{id}/duplicate` |
| `uploadCategoryImage` | `POST .../categories/{id}/images` |
| `changePassword` | ожидать `204` |

---

## 12. Обратная совместимость v1 (proxy aliases)

На период T0–T2 backend может проксировать:

```
GET /api/v1/catalog/brands          → 308 → /api/v2/products/facets/brands
GET /api/v1/site-contact            → 308 → /api/v2/site/settings/contact
POST /api/v1/admin/uploads/products → 308 → /api/v2/admin/products/{id}/images
```

Или thin-handlers, вызывающие те же services (без redirect для POST с multipart).

---

## 13. OpenAPI

После реализации v2:

- `GET /api/v2/openapi.json` — canonical
- `GET /api/v1/openapi.json` — deprecated, помечен в `info.description`

Генерация: стандартный FastAPI `app.openapi()` с `root_path` или отдельный sub-app для v2.

---

## 14. Риски

| Риск | Митигация |
|------|-----------|
| Breaking admin lists | Параллельный v1 до T1; типы в `admin/src/lib/api.ts` |
| 4 site GET → 1 | Aggregate endpoint опционален; секции для PATCH |
| Upload URL change | Admin-only; обновить `uploadHelpers.ts` |
| SEO / внешние ссылки на API | Маловероятно; v1 живёт до T3 |

---

## 15. Решение (TODO)

- [ ] Утвердить aggregate `GET /site/settings` vs только секции
- [ ] Утвердить дату T3 (предложение: 2027-03-01)
- [ ] Начать Этап 1 в ближайшем спринте

---

## Приложение A: полная таблица v1 → v2 (quick reference)

| Method | v1 | v2 |
|--------|----|----|
| GET | `/api/v1/products` | `/api/v2/products` |
| GET | `/api/v1/products/{id}` | `/api/v2/products/{id}` |
| GET | `/api/v1/catalog/brands` | `/api/v2/products/facets/brands` |
| GET | `/api/v1/catalog/price-bounds` | `/api/v2/products/facets/price-bounds` |
| GET | `/api/v1/categories` | `/api/v2/categories` |
| GET | `/api/v1/categories/{id}/filters` | `/api/v2/categories/{id}/filters` |
| GET | `/api/v1/brands` | `/api/v2/brands` |
| GET | `/api/v1/blog-posts` | `/api/v2/blog-posts` |
| GET | `/api/v1/blog-posts/{id}` | `/api/v2/blog-posts/{id}` |
| GET | `/api/v1/portfolio-works` | `/api/v2/portfolio-works` |
| GET | `/api/v1/installation/services` | `/api/v2/installation-services` |
| POST | `/api/v1/installation/requests` | `/api/v2/installation-requests` |
| GET | `/api/v1/service-reviews` | `/api/v2/service-reviews` |
| GET/POST | `/api/v1/products/{id}/reviews` | `/api/v2/products/{id}/reviews` |
| POST | `/api/v1/orders` | `/api/v2/orders` |
| GET | `/api/v1/site-stats` | `/api/v2/site/settings/stats` |
| GET | `/api/v1/site-contact` | `/api/v2/site/settings/contact` |
| GET | `/api/v1/site-announcement` | `/api/v2/site/settings/announcement` |
| GET | `/api/v1/product-highlights` | `/api/v2/site/settings/product-highlights` |
| GET | `/api/v1/vehicles` | `/api/v2/vehicles` |
| GET | `/api/v1/health` | `/api/v2/health` |
| POST | `/api/v1/admin/sessions` | `/api/v2/admin/sessions` |
| PATCH | `/api/v1/admin/me/password` | `/api/v2/admin/me/password` |
| GET | `/api/v1/admin/dashboard` | `/api/v2/admin/dashboard` |
| * | `/api/v1/admin/site-*` | `/api/v2/admin/site/settings/*` |
| GET | `/api/v1/admin/services` | `/api/v2/admin/installation-services` |
| POST | `/api/v1/admin/products` + sourceId | `/api/v2/admin/products/{id}/duplicate` |
| POST | `/api/v1/admin/uploads/*` | `/api/v2/admin/{resource}/{id}/images` |

*Остальные admin CRUD (`products`, `orders`, `reviews`, `attributes`, `categories`, …) — тот же path под `/api/v2/admin`, с PaginatedOut для list GET.*
