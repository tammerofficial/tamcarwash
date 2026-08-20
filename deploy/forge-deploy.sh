#!/usr/bin/env bash
# Laravel Forge deploy hook — Tammer Wash (database-per-tenant)
#
# Forge → Site → Deployment Script:
#   cd $FORGE_SITE_PATH
#   git pull origin $FORGE_SITE_BRANCH
#   bash deploy/forge-deploy.sh
set -euo pipefail

cd "${FORGE_SITE_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"

if [ -n "${FORGE_SITE_PATH:-}" ]; then
    git pull origin "${FORGE_SITE_BRANCH:-main}"
fi

$FORGE_COMPOSER install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# ---------------------------------------------------------------------------
# 1. Environment — create from template if missing; sync ops keys; preserve secrets
# ---------------------------------------------------------------------------
if [ ! -f .env ]; then
    cp deploy/.env.forge .env
    echo "Created .env from deploy/.env.forge"
fi

set_env() {
    local key="$1" value="$2"
    if grep -qE "^${key}=" .env; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env && rm -f .env.bak
    else
        echo "${key}=${value}" >> .env
    fi
}

set_env_if_missing() {
    local key="$1" value="$2"
    if ! grep -qE "^${key}=" .env; then
        echo "${key}=${value}" >> .env
    fi
}

# App (always sync)
set_env APP_ENV production
set_env APP_DEBUG false
set_env APP_URL "https://tamcarwash.on-forge.com"
set_env LOG_LEVEL error

# Database — preserve Forge credentials; only fill missing keys / upgrade sqlite → mysql
set_env DB_CONNECTION landlord
set_env_if_missing DB_HOST 127.0.0.1
set_env_if_missing DB_PORT 3306
set_env_if_missing DB_USERNAME forge

if grep -qE '^LANDLORD_DB_DRIVER=sqlite' .env || ! grep -qE '^LANDLORD_DB_DRIVER=' .env; then
    set_env LANDLORD_DB_DRIVER mysql
    set_env LANDLORD_DB_CONNECTION landlord
    set_env LANDLORD_DB_DATABASE tamcarwash_landlord
    set_env TENANT_DB_DRIVER mysql
    set_env TENANT_DB_CONNECTION tenant
    # Drop local sqlite paths that break production MySQL
    sed -i.bak '/^TENANT_SQLITE_DIRECTORY=/d;/^LANDLORD_DB_DATABASE=.*\.sqlite/d' .env && rm -f .env.bak
fi

set_env_if_missing TENANT_DB_PREFIX tamcarwash_tenant_

# Tenancy domains
set_env TENANCY_PLATFORM_DOMAIN tamcarwash.on-forge.com
set_env TENANCY_CENTRAL_DOMAINS tamcarwash.on-forge.com
set_env TENANCY_SUBDIRECTORY_ENABLED true
set_env SANCTUM_STATEFUL_DOMAINS tamcarwash.on-forge.com

# Session / Cache / Queue — file/sync (no Redis on this server)
set_env SESSION_DRIVER file
set_env SESSION_LIFETIME 120
set_env SESSION_ENCRYPT false
set_env SESSION_PATH /
set_env SESSION_DOMAIN ""
set_env CACHE_STORE file
set_env QUEUE_CONNECTION sync
set_env BROADCAST_CONNECTION log
set_env FILESYSTEM_DISK local
set_env TENANT_CACHE_STORE file
set_env MAIL_MAILER log

if ! grep -qE '^APP_KEY=base64:.+' .env; then
    php artisan key:generate --force
fi

# ---------------------------------------------------------------------------
# 2. Storage + landlord database
# ---------------------------------------------------------------------------
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

DB_USER=$(grep -E '^DB_USERNAME=' .env | head -1 | cut -d= -f2- | tr -d '"' || true)
DB_PASS=$(grep -E '^DB_PASSWORD=' .env | head -1 | cut -d= -f2- | tr -d '"' || true)
DB_NAME=$(grep -E '^LANDLORD_DB_DATABASE=' .env | head -1 | cut -d= -f2- | tr -d '"' || echo "tamcarwash_landlord")

if [ -n "${DB_USER:-}" ] && [ -n "${DB_PASS:-}" ]; then
    MYSQL_PWD="${DB_PASS}" mysql -h 127.0.0.1 -P 3306 -u "$DB_USER" \
        -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
        && echo "Landlord database ensured: ${DB_NAME}" \
        || echo "WARNING: could not create landlord database."
else
    echo "WARNING: DB_PASSWORD empty — set it in Forge → Site → Environment."
fi

# ---------------------------------------------------------------------------
# 3. Frontend build
# ---------------------------------------------------------------------------
if [ -f package.json ]; then
    npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
    npm run build
fi

# ---------------------------------------------------------------------------
# 4. Clear stale caches, then rebuild (fixes 500 from old redis/database config)
# ---------------------------------------------------------------------------
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ---------------------------------------------------------------------------
# 5. Migrations + seeders (forced)
# ---------------------------------------------------------------------------
php artisan migrate --database=landlord --path=database/migrations/landlord --force
php artisan tenants:migrate
php artisan app:seed-production --tenants --force \
    || echo "WARNING: production seeding failed — check storage/logs/laravel.log"

echo "Deploy finished OK."
