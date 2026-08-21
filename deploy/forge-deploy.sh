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

read_env_var() {
    local key="$1"
    grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' || true
}

# App (always sync)
set_env APP_ENV production
set_env APP_DEBUG false
set_env APP_URL "https://tamcarwash.on-forge.com"
set_env LOG_LEVEL error

# Database — NEVER overwrite Forge credentials (DB_USERNAME, DB_PASSWORD, DB_DATABASE)
set_env DB_CONNECTION landlord
set_env_if_missing DB_HOST 127.0.0.1
set_env_if_missing DB_PORT 3306
set_env_if_missing DB_USERNAME forge

FORGE_DB_NAME=$(read_env_var DB_DATABASE)

if grep -qE '^LANDLORD_DB_DRIVER=sqlite' .env || ! grep -qE '^LANDLORD_DB_DRIVER=' .env; then
    set_env LANDLORD_DB_DRIVER mysql
    set_env LANDLORD_DB_CONNECTION landlord
    set_env TENANT_DB_DRIVER mysql
    set_env TENANT_DB_CONNECTION tenant
    # Drop local sqlite paths that break production MySQL
    sed -i.bak '/^TENANT_SQLITE_DIRECTORY=/d;/^LANDLORD_DB_DATABASE=.*\.sqlite/d' .env && rm -f .env.bak
fi

# Platform schema is always a dedicated DB (not the Forge-linked default DB)
set_env_if_missing LANDLORD_DB_DATABASE tamcarwash_landlord
set_env_if_missing TENANT_DB_PREFIX tamcarwash_tenant_

# SSL — required for Forge/DO managed MySQL clusters (port 25060)
_EARLY_DB_HOST=$(read_env_var DB_HOST)
_EARLY_DB_PORT=$(read_env_var DB_PORT)
if [ "${_EARLY_DB_HOST}" != "127.0.0.1" ] && [ "${_EARLY_DB_HOST}" != "localhost" ] || [ "${_EARLY_DB_PORT}" = "25060" ]; then
    set_env_if_missing MYSQL_ATTR_SSL_CA /etc/ssl/certs/ca-certificates.crt
    set_env_if_missing MYSQL_SSL_VERIFY_SERVER_CERT false
fi

# Tenancy domains
set_env TENANCY_PLATFORM_DOMAIN tamcarwash.on-forge.com
set_env TENANCY_CENTRAL_DOMAINS tamcarwash.on-forge.com
set_env TENANCY_SUBDIRECTORY_ENABLED true
set_env TENANCY_SEED_DEMO_USERS true
set_env ALLOW_QUICK_LOGIN true
set_env SANCTUM_STATEFUL_DOMAINS tamcarwash.on-forge.com

# Landlord super admin — bootstrap demo credentials when Forge env is empty (override in Forge UI)
set_env_if_missing LANDLORD_ADMIN_EMAIL admin@tammer.test
set_env_if_missing LANDLORD_ADMIN_PASSWORD password
set_env_if_missing LANDLORD_ADMIN_NAME "مدير المنصة"
set_env_if_missing LANDLORD_ADMIN_ROLE admin

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
# 2. Storage + landlord database (create + grants for site MySQL user)
# ---------------------------------------------------------------------------
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

DB_USER=$(read_env_var DB_USERNAME)
DB_PASS=$(read_env_var DB_PASSWORD)
FORGE_DB_NAME=$(read_env_var DB_DATABASE)
DB_NAME=$(read_env_var LANDLORD_DB_DATABASE)
DB_NAME=${DB_NAME:-${FORGE_DB_NAME:-tamcarwash_landlord}}
TENANT_PREFIX=$(read_env_var TENANT_DB_PREFIX)
TENANT_PREFIX=${TENANT_PREFIX:-tamcarwash_tenant_}
DB_HOST=$(read_env_var DB_HOST)
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=$(read_env_var DB_PORT)
DB_PORT=${DB_PORT:-3306}
MYSQL_SSL_CA=$(read_env_var MYSQL_ATTR_SSL_CA)

is_remote_db() {
    [ "${DB_HOST}" != "127.0.0.1" ] && [ "${DB_HOST}" != "localhost" ]
}

mysql_exec() {
    local user="$1" pass="$2"
    shift 2
    local -a ssl_args=()
    if [ -n "${MYSQL_SSL_CA}" ] && [ -f "${MYSQL_SSL_CA}" ]; then
        ssl_args=(--ssl-mode=REQUIRED --ssl-ca="${MYSQL_SSL_CA}")
    elif is_remote_db; then
        ssl_args=(--ssl-mode=REQUIRED)
    fi
    if [ -n "${pass}" ]; then
        MYSQL_PWD="${pass}" mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${user}" "${ssl_args[@]}" "$@"
    else
        mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${user}" "${ssl_args[@]}" "$@"
    fi
}

mysql_can_use_db() {
    local user="$1" pass="$2" db="$3"
    mysql_exec "${user}" "${pass}" -e "USE \`${db}\`;" >/dev/null 2>&1
}

# If LANDLORD points at a DB the Forge user cannot access, align with Forge DB_DATABASE
if [ -n "${DB_USER}" ] && [ -n "${DB_PASS}" ] && [ -n "${FORGE_DB_NAME}" ]; then
    if [ "${DB_NAME}" != "${FORGE_DB_NAME}" ] && ! mysql_can_use_db "${DB_USER}" "${DB_PASS}" "${DB_NAME}"; then
        if mysql_can_use_db "${DB_USER}" "${DB_PASS}" "${FORGE_DB_NAME}"; then
            echo "Aligning LANDLORD_DB_DATABASE to Forge database: ${FORGE_DB_NAME}"
            set_env LANDLORD_DB_DATABASE "${FORGE_DB_NAME}"
            DB_NAME="${FORGE_DB_NAME}"
        fi
    fi
fi

ensure_landlord_database() {
    local create_sql="CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    local grant_sql="GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
GRANT ALL PRIVILEGES ON \`${TENANT_PREFIX}%\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;"

    if [ -z "${DB_USER:-}" ] || [ -z "${DB_PASS:-}" ]; then
        echo "WARNING: DB_USERNAME or DB_PASSWORD empty — set them in Forge → Site → Environment."
        return 1
    fi

    if mysql_exec "${DB_USER}" "${DB_PASS}" -e "${create_sql}" 2>/dev/null; then
        echo "Landlord database ensured: ${DB_NAME} (as ${DB_USER})"
        return 0
    fi

    echo "Site user cannot CREATE DATABASE — trying Forge admin (forge/root)..."

    if is_remote_db; then
        echo "Remote MySQL cluster (${DB_HOST}) — create '${DB_NAME}' manually in Forge/DO if missing."
        if mysql_can_use_db "${DB_USER}" "${DB_PASS}" "${DB_NAME}"; then
            echo "Landlord database reachable: ${DB_NAME} (existing privileges)"
            return 0
        fi
        return 1
    fi

    for admin_user in forge root; do
        if mysql_exec "${admin_user}" "" -e "${create_sql}" 2>/dev/null; then
            mysql_exec "${admin_user}" "" -e "${grant_sql}" 2>/dev/null \
                && echo "Landlord database ensured: ${DB_NAME} (created by ${admin_user}, granted to ${DB_USER})" \
                && return 0
            echo "WARNING: created ${DB_NAME} but could not GRANT to ${DB_USER} — grant manually in Forge."
            return 0
        fi
    done

    if mysql_can_use_db "${DB_USER}" "${DB_PASS}" "${DB_NAME}"; then
        echo "Landlord database reachable: ${DB_NAME} (existing privileges)"
        return 0
    fi

    echo "WARNING: could not create or access landlord database '${DB_NAME}' for user '${DB_USER}'."
    return 1
}

ensure_landlord_database || true

# ---------------------------------------------------------------------------
# 3. Frontend build
# ---------------------------------------------------------------------------
if [ -f package.json ]; then
    npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
    npm run build
fi

# ---------------------------------------------------------------------------
# 4. Clear stale caches (fixes 500 from old redis/database config)
# ---------------------------------------------------------------------------
php artisan optimize:clear

# ---------------------------------------------------------------------------
# 5. Migrations + seeders (forced — runs on every deploy / Quick Deploy)
# ---------------------------------------------------------------------------
echo "Running landlord migrations..."
php artisan migrate --database=landlord --path=database/migrations/landlord --force

echo "Running tenant migrations..."
php artisan tenants:migrate

echo "Running production seeders (idempotent)..."
SEED_EXIT=0
php artisan db:seed --class=ProductionSeeder --force || SEED_EXIT=$?

if [ "${SEED_EXIT}" -ne 0 ]; then
    echo "WARNING: production seeding failed (exit ${SEED_EXIT}) — check storage/logs/laravel.log"
    echo "  Verify LANDLORD_DB_DATABASE matches a database this user can access:"
    echo "    DB_USERNAME=${DB_USER:-?} LANDLORD_DB_DATABASE=${DB_NAME:-?} DB_DATABASE=${FORGE_DB_NAME:-?}"
fi

# ---------------------------------------------------------------------------
# 6. Rebuild caches after migrate/seed
# ---------------------------------------------------------------------------
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

LANDLORD_ADMIN_EMAIL=$(read_env_var LANDLORD_ADMIN_EMAIL)
LANDLORD_ADMIN_PASSWORD=$(read_env_var LANDLORD_ADMIN_PASSWORD)
if [ "${LANDLORD_ADMIN_EMAIL}" = "admin@tammer.test" ] || [ "${LANDLORD_ADMIN_PASSWORD}" = "password" ]; then
    echo "NOTE: Demo landlord admin in use (${LANDLORD_ADMIN_EMAIL}). Set LANDLORD_ADMIN_* in Forge → Environment before go-live."
fi

echo "Deploy finished OK."
