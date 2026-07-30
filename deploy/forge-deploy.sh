#!/usr/bin/env bash
# Laravel Forge deploy hook — Tammer Wash (database-per-tenant)
# Paste into Forge → Site → Deployment Script, or: bash deploy/forge-deploy.sh
set -euo pipefail

cd "${FORGE_SITE_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"

$FORGE_COMPOSER install --no-dev --no-interaction --prefer-dist --optimize-autoloader

if [ -f package.json ]; then
    npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
    npm run build
fi

php artisan config:clear
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Landlord (platform) schema only — never run bare `php artisan migrate`
php artisan migrate --database=landlord --path=database/migrations/landlord --force

php artisan app:seed-production --force

# Apply new tenant migrations to every provisioned tenant
php artisan tenants:migrate

php artisan optimize

echo "Deploy finished: landlord migrated, production seeders run, tenant migrations applied."
echo "If web routes return 500 but /up works, set SESSION_DRIVER=file in Forge env and run: php artisan config:clear && php artisan optimize"
