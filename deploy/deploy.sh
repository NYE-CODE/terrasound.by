#!/usr/bin/env bash
# Деплой terrasound.by на Linux-сервере.
#
# Первый запуск на сервере:
#   1. git clone … && cd terrasound.by
#   2. cp deploy/deploy.env.example deploy/deploy.env && nano deploy/deploy.env
#   3. cp backend/.env.example backend/.env && nano backend/.env
#   4. chmod +x deploy/deploy.sh
#   5. ./deploy/deploy.sh
#
# Повторный деплой:
#   ./deploy/deploy.sh
#
# Опции:
#   --skip-pull       не делать git pull
#   --skip-backend    не трогать Python/venv/миграции/API
#   --skip-frontend   не собирать frontend
#   --skip-admin      не собирать admin
#   --skip-nginx      не перезагружать nginx

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="$SCRIPT_DIR/deploy.env"

SKIP_PULL=false
SKIP_BACKEND=false
SKIP_FRONTEND=false
SKIP_ADMIN=false
SKIP_NGINX=false

for arg in "$@"; do
  case "$arg" in
    --skip-pull) SKIP_PULL=true ;;
    --skip-backend) SKIP_BACKEND=true ;;
    --skip-frontend) SKIP_FRONTEND=true ;;
    --skip-admin) SKIP_ADMIN=true ;;
    --skip-nginx) SKIP_NGINX=true ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *)
      echo "Неизвестный аргумент: $arg (используйте --help)" >&2
      exit 1
      ;;
  esac
done

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[deploy]\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m[deploy]\033[0m %s\n' "$*" >&2; exit 1; }

load_env_file() {
  local file="$1"
  # shellcheck disable=SC1090
  set -a
  source "$file"
  set +a
}

if [[ -f "$DEPLOY_ENV" ]]; then
  log "Загружаю $DEPLOY_ENV"
  load_env_file "$DEPLOY_ENV"
else
  warn "Файл $DEPLOY_ENV не найден — используются значения по умолчанию."
  warn "Скопируйте: cp deploy/deploy.env.example deploy/deploy.env"
fi

# Defaults (если не заданы в deploy.env)
APP_DIR="${APP_DIR:-$REPO_ROOT}"
GIT_BRANCH="${GIT_BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
PYTHON="${PYTHON:-python3}"
VENV_DIR="${VENV_DIR:-.venv}"
API_SERVICE="${API_SERVICE:-terrasound-api}"
API_USER="${API_USER:-www-data}"
API_GROUP="${API_GROUP:-www-data}"
API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8000}"
PNPM="${PNPM:-pnpm}"
PNPM_INSTALL_FLAGS="${PNPM_INSTALL_FLAGS:---frozen-lockfile}"
VITE_API_URL="${VITE_API_URL:-}"
VITE_SITE_URL="${VITE_SITE_URL:-https://terrasound.by}"
PRERENDER_API_URL="${PRERENDER_API_URL:-http://${API_HOST}:${API_PORT}}"
BUILD_FRONTEND="${BUILD_FRONTEND:-true}"
BUILD_ADMIN="${BUILD_ADMIN:-true}"
NGINX_RELOAD="${NGINX_RELOAD:-true}"
SUDO="${SUDO:-sudo}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"
SKIP_API_RESTART="${SKIP_API_RESTART:-false}"

BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
ADMIN_DIR="$APP_DIR/admin"
BACKEND_ENV="$BACKEND_DIR/.env"
VENV_PATH="$BACKEND_DIR/$VENV_DIR"
HEALTH_URL="http://${API_HOST}:${API_PORT}/api/health"

cd "$APP_DIR"
log "Рабочая директория: $APP_DIR"

# --- backend/.env (секреты приложения, не трогаем) ---
if [[ "$SKIP_BACKEND" == false ]] && [[ ! -f "$BACKEND_ENV" ]]; then
  fail "Нет $BACKEND_ENV — создайте из backend/.env.example и задайте SECRET_KEY, ADMIN_PASSWORD, ENVIRONMENT=production"
fi

if [[ -f "$BACKEND_ENV" ]]; then
  # Только проверка ключевых переменных (без export в shell — там могут быть спецсимволы)
  grep -q '^SECRET_KEY=.\+' "$BACKEND_ENV" 2>/dev/null || warn "backend/.env: проверьте SECRET_KEY"
  grep -q '^ENVIRONMENT=production' "$BACKEND_ENV" 2>/dev/null || warn "backend/.env: рекомендуется ENVIRONMENT=production на сервере"
fi

# --- git pull ---
if [[ "$SKIP_PULL" == false ]]; then
  log "git pull $GIT_REMOTE $GIT_BRANCH"
  git fetch "$GIT_REMOTE"
  git checkout "$GIT_BRANCH"
  git pull --ff-only "$GIT_REMOTE" "$GIT_BRANCH"
else
  log "git pull пропущен (--skip-pull)"
fi

# --- Backend: venv, deps, migrations ---
if [[ "$SKIP_BACKEND" == false ]]; then
  log "Backend: виртуальное окружение и зависимости"
  if [[ ! -d "$VENV_PATH" ]]; then
    "$PYTHON" -m venv "$VENV_PATH"
  fi
  # shellcheck disable=SC1091
  source "$VENV_PATH/bin/activate"
  pip install -q --upgrade pip
  pip install -q -r "$BACKEND_DIR/requirements.txt"

  log "Backend: миграции"
  cd "$BACKEND_DIR"
  python run_migrations.py
  cd "$APP_DIR"

  log "Backend: права для $API_USER (systemd)"
  $SUDO chown -R "$API_USER:$API_GROUP" "$VENV_PATH" "$BACKEND_ENV"
  $SUDO chown "$API_USER:$API_GROUP" "$BACKEND_DIR"
  if [[ -f "$BACKEND_DIR/terrasound.db" ]]; then
    $SUDO chown "$API_USER:$API_GROUP" "$BACKEND_DIR/terrasound.db"
    $SUDO chmod 664 "$BACKEND_DIR/terrasound.db"
  fi
  $SUDO chmod 750 "$BACKEND_DIR"
  $SUDO chmod 640 "$BACKEND_ENV"

  if [[ "$SKIP_API_RESTART" == false ]]; then
    log "Перезапуск API: $API_SERVICE"
    if $SUDO systemctl cat "$API_SERVICE.service" &>/dev/null; then
      $SUDO systemctl restart "$API_SERVICE"
    else
      warn "systemd-сервис $API_SERVICE не найден. Установите deploy/terrasound-api.service.example"
      warn "Пропускаю restart API."
    fi

    log "Ожидание $HEALTH_URL (до ${HEALTH_TIMEOUT}s)"
    deadline=$((SECONDS + HEALTH_TIMEOUT))
    until curl -sf "$HEALTH_URL" >/dev/null; do
      if (( SECONDS >= deadline )); then
        fail "API не ответил на $HEALTH_URL за ${HEALTH_TIMEOUT}s"
      fi
      sleep 1
    done
    log "API OK"
  else
    log "Перезапуск API пропущен (SKIP_API_RESTART=true)"
  fi
else
  log "Backend пропущен (--skip-backend)"
fi

# --- Node: pnpm install (корень monorepo) ---
need_node=false
[[ "$BUILD_FRONTEND" == true && "$SKIP_FRONTEND" == false ]] && need_node=true
[[ "$BUILD_ADMIN" == true && "$SKIP_ADMIN" == false ]] && need_node=true

if [[ "$need_node" == true ]]; then
  command -v "$PNPM" >/dev/null 2>&1 || fail "pnpm не найден. Установите: npm i -g pnpm"
  log "pnpm install $PNPM_INSTALL_FLAGS"
  cd "$APP_DIR"
  $PNPM install $PNPM_INSTALL_FLAGS
fi

# --- Frontend build ---
if [[ "$BUILD_FRONTEND" == true && "$SKIP_FRONTEND" == false ]]; then
  [[ -n "$VITE_API_URL" ]] || fail "Задайте VITE_API_URL в deploy/deploy.env"
  log "Сборка frontend (VITE_API_URL=$VITE_API_URL)"
  cd "$FRONTEND_DIR"
  export VITE_API_URL
  export VITE_SITE_URL
  $PNPM exec vite build
  log "Prerender (API=$PRERENDER_API_URL)"
  VITE_API_URL="$PRERENDER_API_URL" VITE_SITE_URL="$VITE_SITE_URL" node scripts/prerender.mjs
  cd "$APP_DIR"
  log "frontend/dist готов"
else
  log "Сборка frontend пропущена"
fi

# --- Admin build ---
if [[ "$BUILD_ADMIN" == true && "$SKIP_ADMIN" == false ]]; then
  [[ -n "$VITE_API_URL" ]] || fail "Задайте VITE_API_URL в deploy/deploy.env"
  log "Сборка admin (VITE_API_URL=$VITE_API_URL)"
  cd "$ADMIN_DIR"
  export VITE_API_URL
  $PNPM exec vite build
  cd "$APP_DIR"
  log "admin/dist готов"
else
  log "Сборка admin пропущена"
fi

# --- Nginx reload ---
if [[ "$NGINX_RELOAD" == true && "$SKIP_NGINX" == false ]]; then
  if command -v nginx >/dev/null 2>&1; then
    log "Перезагрузка nginx"
    $SUDO nginx -t
    $SUDO systemctl reload nginx
  else
    warn "nginx не найден — пропуск reload"
  fi
else
  log "Перезагрузка nginx пропущена"
fi

log "Деплой завершён успешно"
