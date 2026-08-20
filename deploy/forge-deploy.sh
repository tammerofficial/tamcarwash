#!/usr/bin/env bash
# Laravel Forge deploy hook — Tammer Wash (database-per-tenant)
#
# Forge → Site → Deployment Script should be ONLY:
#   cd $FORGE_SITE_PATH
#   git pull origin $FORGE_SITE_BRANCH
#   bash deploy/forge-deploy.sh
#
# Fully self-healing: rebuilds .env from deploy/.env.forge, fixes drivers,
# ensures the landlord database exists, then forces migrations + seeders.
set -euo pipefail

cd "${FORGE_SITE_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"

# Pull latest code when running under Forge (no-op if Forge already pulled)
if [ -n "${FORGE_SITE_PATH:-}" ]; then
    git pull origin "${FORGE_SITE_BRANCH:-main}"
fi

$FORGE_COMPOSER install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# ---------------------------------------------------------------------------
# 1. Environment: materialize .env from the committed template, then force
#    operational keys. Secrets already on the server are preserved.
# ---------------------------------------------------------------------------
if [ ! -f .env ]; then
    cp deploy/.env.forge .env
    echo "Created .env from deploy/.env.forge"
fi

set_env() {
    local key="$1" value="$2"
    if grep -qE "^${key}=" .env; then
        # -i.bak works on both GNU (Forge/Linux) and BSD (macOS) sed
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env && rm -f .env.bak
    else
        echo "${key}=${value}" >> .env
    fi
}

# App
set_env APP_ENV production
set_env APP_DEBUG false
set_env APP_URL "https://tamcarwash.on-forge.com"
set_env LOG_LEVEL error

# Database — MySQL on this Forge server (never sqlite in production)
set_env DB_CONNECTION landlord
set_env DB_HOST 127.0.0.1
set_env DB_PORT 3306
set_env LANDLORD_DB_DRIVER mysql
set_env LANDLORD_DB_CONNECTION landlord
set_env LANDLORD_DB_DATABASE tamcarwash_landlord
set_env TENANT_DB_DRIVER mysql
set_env TENANT_DB_CONNECTION tenant
if ! grep -qE '^DB_USERNAME=' .env; then set_env DB_USERNAME forge; fi

# Tenancy domains — update these + deploy/.env.forge when attaching a custom domain
set_env TENANCY_PLATFORM_DOMAIN tamcarwash.on-forge.com
set_env TENANCY_CENTRAL_DOMAINS tamcarwash.on-forge.com
set_env TENANCY_SUBDIRECTORY_ENABLED true
set_env SANCTUM_STATEFUL_DOMAINS tamcarwash.on-forge.com

# Session / Cache / Queue — this server has no Redis; wrong values here 500
# every web route while /up and the stateless API keep returning 200.
set_env SESSION_DRIVER file
set_env SESSION_LIFETIME 120
set_env SESSION_ENCRYPT false
set_env SESSION_PATH /
set_env SESSION_DOMAIN null
set_env CACHE_STORE file
set_env QUEUE_CONNECTION sync
set_env BROADCAST_CONNECTION log
set_env FILESYSTEM_DISK local
set_env TENANT_CACHE_STORE file
set_env MAIL_MAILER log

# Secrets: generate APP_KEY only if missing (never rotate an existing key)
if ! grep -qE '^APP_KEY=base64:.+' .env; then
    php artisan key:generate --force
fi

# ---------------------------------------------------------------------------
# 2. Storage + landlord database
# ---------------------------------------------------------------------------
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

DB_USER=$(grep -E '^DB_USERNAME=' .env | head -1 | cut -d= -f2- | tr -d '"' || true)
DB_PASS=$(grep -E '^DB_PASSWORD=' .env | head -1 | cut -d= -f2- | tr -d '"' || true)
if [ -n "${DB_USER:-}" ]; then
    MYSQL_PWD="${DB_PASS:-}" mysql -h 127.0.0.1 -P 3306 -u "$DB_USER" \
        -e "CREATE DATABASE IF NOT EXISTS \`tamcarwash_landlord\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
        && echo "Landlord database ensured." \
        || echo "WARNING: could not create landlord database — verify DB_USERNAME/DB_PASSWORD in Forge env."
fi

# ---------------------------------------------------------------------------
# 3. Frontend build
# ---------------------------------------------------------------------------
if [ -f package.json ]; then
    npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
    npm run build
fi

# ---------------------------------------------------------------------------
# 4. Caches first: a failure below must never leave the site without config cache
# ---------------------------------------------------------------------------
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ---------------------------------------------------------------------------
# 5. Migrations + seeders (forced)
# ---------------------------------------------------------------------------
# Landlord (platform) schema only — never run bare `php artisan migrate`
php artisan migrate --database=landlord --path=database/migrations/landlord --force

# Apply new tenant migrations to every provisioned tenant
php artisan tenants:migrate

# Seeding is idempotent and re-runs on every deploy; a seeder bug must never
# take the site down, so never abort the deploy here.
php artisan app:seed-production --tenants --force \
    || echo "WARNING: production seeding failed — site is live, check storage/logs/laravel.log"

echo "Deploy finished: env synced, caches rebuilt, landlord + tenants migrated, production seeders run."
