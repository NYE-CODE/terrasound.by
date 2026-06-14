# Деплой на сервер

Скрипт для Linux (VPS): `git pull` → зависимости → миграции → restart API → сборка статики → reload nginx.

## Два файла конфигурации

| Файл | Назначение | В git? |
|---|---|---|
| `deploy/deploy.env` | Пути, ветка, URL для сборки, имя systemd-сервиса | **Нет** (локально на сервере) |
| `backend/.env` | Секреты и runtime API: `SECRET_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`, `CORS_ORIGINS`, `ENVIRONMENT=production` | **Нет** |

**Почему два файла:** `backend/.env` читает FastAPI (pydantic-settings). В нём могут быть символы, которые неудобно `source`-ить в bash. `deploy/deploy.env` — только параметры деплоя без секретов приложения.

`frontend/.env` и `admin/.env` **не нужны на сервере** — `VITE_API_URL` задаётся из `deploy/deploy.env` при сборке.

## Первичная настройка сервера

```bash
# Зависимости ОС (Debian/Ubuntu)
sudo apt update
sudo apt install -y git python3 python3-venv curl nginx

# Node + pnpm (пример через nvm или nodesource — установите Node 18+)
npm install -g pnpm

# Клонирование
sudo mkdir -p /var/www
sudo git clone <repo-url> /var/www/terrasound.by
sudo chown -R $USER:www-data /var/www/terrasound.by

cd /var/www/terrasound.by

# Конфиг деплоя
cp deploy/deploy.env.example deploy/deploy.env
nano deploy/deploy.env

# Секреты приложения
cp backend/.env.example backend/.env
nano backend/.env   # ENVIRONMENT=production, SECRET_KEY, ADMIN_PASSWORD, CORS_ORIGINS

# systemd для API
sudo cp deploy/terrasound-api.service.example /etc/systemd/system/terrasound-api.service
sudo nano /etc/systemd/system/terrasound-api.service
sudo systemctl daemon-reload
sudo systemctl enable terrasound-api

# nginx — API на том же домене: terrasound.by/api/
sudo cp deploy/nginx/terrasound.by.conf /etc/nginx/sites-available/terrasound.by
# если nginx -t ругается на SSL — сначала HTTP-версия:
# sudo cp deploy/nginx/terrasound.by.http.conf /etc/nginx/sites-available/terrasound.by
sudo ln -sf /etc/nginx/sites-available/terrasound.by /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/api.terrasound.by
sudo nginx -t && sudo systemctl reload nginx
curl -s https://terrasound.by/api/v1/health

# nginx — админка: admin.terrasound.by + /api/ → backend (обязательно для логина)
sudo cp deploy/nginx/admin.terrasound.by.conf /etc/nginx/sites-available/admin.terrasound.by
sudo ln -sf /etc/nginx/sites-available/admin.terrasound.by /etc/nginx/sites-enabled/
sudo certbot --nginx -d admin.terrasound.by   # если ещё нет SSL
sudo nginx -t && sudo systemctl reload nginx
curl -s https://admin.terrasound.by/api/v1/health   # должен быть JSON, не HTML

chmod +x deploy/deploy.sh
./deploy/deploy.sh

# или без chmod:
bash deploy/deploy.sh
```

### Кэш статики (nginx)

Правила в `deploy/nginx/includes/static-cache.conf` (подключается из конфигов витрины и админки):

| Путь | Cache-Control | Зачем |
|---|---|---|
| `/assets/*` | `max-age=31536000, immutable` | Vite добавляет хэш в имя файла — безопасно кэшировать год |
| `/fonts/*` | то же | Self-hosted шрифты, редко меняются |
| `*.html` | `no-cache` | После деплоя браузер подтягивает свежий HTML с новыми хэшами |
| favicon, `.webmanifest` | `max-age=604800` (7 дней) | Иконки в корне `public/` |

### Security headers (nginx)

Файл `deploy/nginx/includes/security-headers.conf` — на HTTPS для витрины и админки:

| Заголовок | Значение |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

HTTP (порт 80) редиректит на HTTPS; `/.well-known/acme-challenge/` оставлен для продления Let's Encrypt.

### Загрузки изображений

Каталог `uploads/` в корне репозитория (на сервере: `/var/www/terrasound.by/uploads/`):

| Путь | Назначение |
|---|---|
| `uploads/categories/` | изображения категорий |
| `uploads/products/{product_id}/` | главное и галерея товара |
| `uploads/products/_pending/` | временные файлы до создания товара |
| `uploads/portfolio/{work_id}/` | фото блока «Наши работы» |
| `uploads/portfolio/_pending/` | временные файлы до создания работы |

Раздача: nginx `location /uploads/` на `terrasound.by` и `admin.terrasound.by`. API: `POST /api/v1/admin/uploads/categories|products|portfolio` (multipart, JWT).

Проверка после `nginx -t && systemctl reload nginx`:

```bash
curl -sI https://terrasound.by/ | grep -iE 'strict-transport|x-frame|x-content-type|referrer-policy|cross-origin-opener'
curl -sI http://terrasound.by/ | head -3   # 301 → https
```

## Повторный деплой

```bash
cd /var/www/terrasound.by
./deploy/deploy.sh
```

## Опции

```bash
./deploy/deploy.sh --skip-pull       # без git pull
./deploy/deploy.sh --skip-backend    # без Python/миграций/restart API
./deploy/deploy.sh --skip-frontend   # без сборки витрины
./deploy/deploy.sh --skip-admin      # без сборки админки
./deploy/deploy.sh --skip-nginx      # без reload nginx
```

## Пример `deploy/deploy.env`

```bash
APP_DIR=/var/www/terrasound.by
GIT_BRANCH=main
API_SERVICE=terrasound-api
VITE_API_URL=https://terrasound.by
ADMIN_VITE_API_URL=
VITE_SITE_URL=https://terrasound.by
PRERENDER_API_URL=http://127.0.0.1:8000
```

Админка (`admin.terrasound.by`) должна собираться с **пустым** `ADMIN_VITE_API_URL` и проксировать `/api/` через `deploy/nginx/admin.terrasound.by.conf` — иначе браузер ходит на `terrasound.by/api` с другого домена и при ошибках API часто показывает «CORS error».

## Пример `backend/.env` (production)

```bash
DATABASE_URL=sqlite:////var/www/terrasound.by/backend/terrasound.db
SECRET_KEY=<длинная случайная строка>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<надёжный пароль>
CORS_ORIGINS=https://terrasound.by,https://admin.terrasound.by
ENVIRONMENT=production
TRUST_PROXY_HEADERS=true
```

После обновления с усилением JWT (поле `ver` в токене) все админы должны **выйти и войти заново** — старые сессии перестанут работать.

`TRUST_PROXY_HEADERS=true` нужен на production за nginx, иначе rate limit считает все запросы с одного IP (прокси).

## Миграции отдельно

```bash
cd backend
source .venv/bin/activate
python run_migrations.py
```

## Автодеплой по webhook (опционально)

Можно повесить на GitHub Actions или `post-receive` hook вызов `./deploy/deploy.sh` по SSH — скрипт идемпотентен.
