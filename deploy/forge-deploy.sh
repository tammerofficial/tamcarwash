#!/usr/bin/env bash
# Laravel Forge deploy hook — Tammer Wash (database-per-tenant)
# Paste into Forge → Site → Deployment Script, or: bash deploy/forge-deploy.sh
set -euo pipefail

cd "${FORGE_SITE_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"

# Pull latest code when running under Forge (no-op if Forge already pulled)
if [ -n "${FORGE_SITE_PATH:-}" ]; then
    git pull origin "${FORGE_SITE_BRANCH:-main}"
fi

$FORGE_COMPOSER install --no-dev --no-interaction --prefer-dist --optimize-autoloader

if [ -f package.json ]; then
    npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
    npm run build
fi

# --- Environment guards -----------------------------------------------------
# This Forge server has no Redis. If SESSION_DRIVER points at redis/database
# (or file sessions are not writable), every web route returns 500 while /up
# and the stateless API keep returning 200. Pin the driver to file.
if ! grep -qE '^APP_KEY=base64:.+' .env; then
    php artisan key:generate --force
fi

if grep -qE '^SESSION_DRIVER=' .env; then
    sed -i 's/^SESSION_DRIVER=.*/SESSION_DRIVER=file/' .env
else
    echo 'SESSION_DRIVER=file' >> .env
fi

mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

# --- Caches first: a failure below must never leave the site without config cache
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Landlord (platform) schema only — never run bare `php artisan migrate`
php artisan migrate --database=landlord --path=database/migrations/landlord --force

# Apply new tenant migrations to every provisioned tenant
php artisan tenants:migrate

# Seeding is idempotent and re-runs on every deploy; a seeder bug must never
# take the site down, so never abort the deploy here.
# NOTE: app:seed-production has no --force option — passing it aborts the deploy.
php artisan app:seed-production || echo "WARNING: production seeding failed — site is live, check storage/logs/laravel.log"

echo "Deploy finished: caches rebuilt, landlord migrated, tenant migrations applied, production seeders run."
