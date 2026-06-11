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
curl -s http://terrasound.by/api/health

# nginx — админка: admin.terrasound.by + /api/ → backend (обязательно для логина)
sudo cp deploy/nginx/admin.terrasound.by.conf /etc/nginx/sites-available/admin.terrasound.by
sudo ln -sf /etc/nginx/sites-available/admin.terrasound.by /etc/nginx/sites-enabled/
sudo certbot --nginx -d admin.terrasound.by   # если ещё нет SSL
sudo nginx -t && sudo systemctl reload nginx
curl -s https://admin.terrasound.by/api/health   # должен быть JSON, не HTML

chmod +x deploy/deploy.sh
./deploy/deploy.sh

# или без chmod:
bash deploy/deploy.sh
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
```

## Миграции отдельно

```bash
cd backend
source .venv/bin/activate
python run_migrations.py
```

## Автодеплой по webhook (опционально)

Можно повесить на GitHub Actions или `post-receive` hook вызов `./deploy/deploy.sh` по SSH — скрипт идемпотентен.
