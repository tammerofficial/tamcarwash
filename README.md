# Tammer Wash

Production-ready SaaS platform for fixed-location car wash businesses in Oman.

**Stack:** Laravel 13 · PHP 8.3+ · React 19 + TypeScript · Tailwind CSS · shadcn/ui · Sanctum · Spatie packages · Octane/RoadRunner · **Local: SQLite 3** · **Production: MySQL 8.4 + Redis**

---

## Architecture

### Database-per-Tenant Architecture / بنية قاعدة بيانات لكل مغسلة

Tammer Wash is a **SaaS multi-tenant platform**. Each car wash (مغسلة) gets its **own isolated database**. There is no shared business schema and **no `tenant_id` column** on orders, customers, branches, or any other operational table.

#### English

| Layer | Connection | Schema path | Contains |
|-------|------------|-------------|----------|
| **Landlord** | `landlord` | `database/migrations/landlord/` | Platform control only: `tenants`, `tenant_domains`, `tenant_databases`, `plans`, `subscriptions`, `platform_users`, `platform_audit_logs`, `tenant_provisioning_logs`, plus Laravel infra (`cache`, `jobs`, `personal_access_tokens`) and `platform_settings` |
| **Tenant** | `tenant` (dynamic) | `database/migrations/tenant/` | All business data: branches, customers, vehicles, services, bookings, queue, orders, invoices, payments, permissions, users |

**How isolation works**

1. A request hits tenant middleware (`IdentifyTenantBySubdomain`, custom domain, subdirectory, or `X-Tenant-Slug` header).
2. `TenantConnectionManager` loads the tenant record from the **landlord** DB, reads `tenant_databases`, and reconfigures the `tenant` connection:
   - **Local (SQLite):** `database/tenants/{slug}.sqlite`
   - **Production (MySQL):** schema `tamcarwash_tenant_{slug}` on the shared MySQL server
3. All business Eloquent models extend `App\Models\TenantModel` and always use the `tenant` connection — never the landlord DB.
4. Landlord API routes use `EnsureLandlordContext` middleware, which calls `useLandlord()` before any platform query.

**Provisioning flow** (`tenants:create` → `TenantProvisioningService`)

```
validate → create DB file/schema → register in tenant_databases → migrate tenant path → seed → configure domains → activate
```

- **SQLite:** creates `database/tenants/{slug}.sqlite`, runs `database/migrations/tenant`
- **MySQL:** `CREATE DATABASE tamcarwash_tenant_{slug}`, stores credentials in `tenant_databases`, runs the same tenant migrations

**Forge / production MySQL setup**

1. Set in Forge env: `LANDLORD_DB_DRIVER=mysql`, `TENANT_DB_DRIVER=mysql`, landlord DB `tamcarwash_landlord`.
2. Run landlord migrations once: `php artisan migrate --database=landlord --path=database/migrations/landlord`
3. Provision tenants via UI or `tenants:create` — each tenant gets its own MySQL schema automatically.
4. Never run `php artisan migrate` without `--path` — business migrations live only under `database/migrations/tenant/` and are executed per tenant by `TenantMigrationRunner`.

#### العربية

| الطبقة | الاتصال | مسار الهجرات | المحتوى |
|--------|---------|--------------|---------|
| **Landlord** | `landlord` | `database/migrations/landlord/` | التحكم بالمنصة فقط: المستأجرون، النطاقات، قواعد البيانات، الخطط، الاشتراكات، مستخدمو المنصة، سجلات التدقيق، سجلات التجهيز |
| **Tenant** | `tenant` (ديناميكي) | `database/migrations/tenant/` | كل بيانات العمل: الفروع، العملاء، المركبات، الخدمات، الحجوزات، الطابور، الطلبات، الفواتير |

**مبدأ العزل:** كل مغسلة = قاعدة بيانات مستقلة. لا يوجد `tenant_id` في جداول العمل — العزل يتم عبر قاعدة منفصلة وليس عمود مشترك.

**محلياً (SQLite):** ملف `database/tenants/{slug}.sqlite` لكل مغسلة.

**الإنتاج (MySQL على Forge):** schema منفصل `tamcarwash_tenant_{slug}` لكل مغسلة على نفس السيرفر.

**Tenant detection:**
1. Subdomain — `{slug}.tamcarwash.test` or `{slug}.tamcarwash.on-forge.com`
2. Subdirectory — `{platform-domain}/{tenant-slug}/…` e.g. `https://tamcarwash.on-forge.com/alwadi-wash/dashboard`
3. Custom domain — mapped in `tenant_domains`
4. Header / local fallback — `X-Tenant-Slug`, `X-Tenant-Id`, or local default tenant on central domains

**Subdirectory routing strategy:** tenant SPA routes live under `/{slug}/*` on central domains (React Router `basename`). Reserved root paths (`api`, `login`, `register`, `sanctum`, `up`, `landlord`, `build`, `storage`, `dashboard`) are never treated as tenant slugs. Landlord admin UI stays at `/landlord/*`.

### Module layout

```
app/
├── Console/Commands/          # tenants:* + app:seed-production
├── Http/Middleware/Tenancy/   # Subdomain, domain, context switching
├── Models/Landlord/           # Tenant, Plan, Subscription, PlatformUser…
├── Services/Tenancy/          # ConnectionManager, Provisioning, MigrationRunner
└── Modules/
    ├── Branches/              # Branches, working hours, holidays, wash bays
    ├── Customers/             # Profiles, loyalty, notes, blacklist
    ├── Vehicles/              # Plates, companies, vehicle types
    ├── Services/              # Categories, addons, pricing, consumables
    ├── Pricing/               # Rules, coupons, discounts, peak hours
    ├── Booking/               # Slots, bookings, overbooking prevention
    ├── Queue/                 # Walk-in/booked queue, analytics
    ├── Orders/                # Full status flow (pending → completed/cancelled)
    ├── Finance/               # Invoices, payments, VAT, tax reports, PDF
    └── Shared/                # Auth, dashboard, API base

database/
├── migrations/landlord/       # Platform schema
├── migrations/tenant/         # Per-tenant business schema
└── seeders/                   # Idempotent production seeders

resources/js/                  # React 19 SPA (Arabic-first RTL)
```

---

## Quick start

### 1. Prerequisites

- PHP 8.3+ with `pdo_sqlite`, Composer 2
- Node.js 20+, npm
- **Local dev:** SQLite 3 only (no Docker required)
- **Production:** MySQL 8.4 + Redis (Docker Compose optional locally)

### 2. Clone & install

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
npm run build
```

### 3. Configure local database (SQLite)

In your local `.env` (never commit it), set SQLite drivers and absolute paths — see the commented block in `.env.example`:

```bash
LANDLORD_DB_DRIVER=sqlite
LANDLORD_DB_CONNECTION=landlord
LANDLORD_DB_DATABASE=/absolute/path/to/tamcarwash/database/landlord.sqlite

TENANT_DB_DRIVER=sqlite
TENANT_SQLITE_DIRECTORY=/absolute/path/to/tamcarwash/database/tenants

SESSION_DRIVER=file
QUEUE_CONNECTION=sync
CACHE_STORE=file
TENANT_CACHE_STORE=file

touch database/landlord.sqlite
mkdir -p database/tenants

php artisan config:clear
```

Tenant provisioning creates `database/tenants/{slug}.sqlite` per tenant (not committed).

### 3b. Production infrastructure (MySQL + Redis)

```bash
docker compose up -d
```

Use `LANDLORD_DB_DRIVER=mysql` and `TENANT_DB_DRIVER=mysql` with the MySQL block in `.env.example`.

**Local Docker + host MySQL:** If port 3306 is already in use, set `MYSQL_PORT=3307` and match `DB_PORT`, `LANDLORD_DB_PORT`, and `TENANT_DB_PORT` in `.env`. Shared credentials: user `tamcarwash`, password `secret`, landlord database `tamcarwash_landlord`.

After provisioning, refresh tenant cache if login fails after switching drivers: `php artisan tenants:refresh-cache`.

Quick login check:

```bash
curl -s -X POST http://127.0.0.1:8010/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'X-Tenant-Slug: demo' \
  -d '{"email":"owner@demo.test","password":"password"}'
```

### 4. Run landlord migrations

```bash
php artisan migrate --database=landlord --path=database/migrations/landlord
php artisan app:seed-production
```

### 5. Create a tenant

```bash
php artisan tenants:create \
  --name="مغسلة تمير التجريبية" \
  --slug=demo \
  --owner-email=owner@demo.test \
  --owner-password=password \
  --plan=starter
```

This runs the idempotent 8-step provisioning flow: create DB → migrate → seed → activate.

### 6. Seed tenant data (optional rerun)

```bash
php artisan app:seed-production --tenants
# or single tenant:
php artisan app:seed-production --tenant=demo
```

For the **demo** tenant, this also runs `DemoTenantUsersSeeder`, which creates idempotent quick-login users (owner, manager, cashier, worker) with password `password`.

### Quick login (demo tenant, local dev)

On the tenant login page (`http://demo.tamcarwash.test:8000`), **Quick Login** buttons appear in local/dev mode (`import.meta.env.DEV` or `allowQuickLogin` in `app.blade.php`).

| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@demo.test` | `password` |
| Manager | `manager@demo.test` | `password` |
| Cashier | `cashier@demo.test` | `password` |
| Worker | `worker@demo.test` | `password` |

These accounts are seeded by `DemoTenantUsersSeeder` when:

- Provisioning the demo tenant (`tenants:create --slug=demo ...`)
- Re-running tenant seed: `php artisan app:seed-production --tenant=demo`

If quick login fails after provisioning, rerun:

```bash
php artisan app:seed-production --tenant=demo
```

### 7. Development servers

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (React HMR)
npm run dev
```

Add to `/etc/hosts`:
```
127.0.0.1 tamcarwash.test demo.tamcarwash.test admin.tamcarwash.test
```

- **Tenant SPA:** http://demo.tamcarwash.test:8000 or http://tamcarwash.test:8000/demo/dashboard (subdirectory)
- **Tenant API:** http://demo.tamcarwash.test:8000/api/v1
- **Landlord UI:** http://tamcarwash.test:8000/landlord/login
- **Landlord API:** http://tamcarwash.test:8000/api/landlord/v1

### Platform admin login (local)

| Email | Password |
|-------|----------|
| `admin@tammer.test` | `password` |

Seed with: `php artisan app:seed-production` (runs `PlatformUserSeeder`).

---

## Laravel Forge deployment

Tammer Wash uses **landlord** and **per-tenant** migration paths. Running bare `php artisan migrate` on the default connection targets the wrong database and can fail (for example `permissions` already exists on legacy `tamcarwash` from old root Spatie migrations).

**Forge environment (required)**

| Variable | Value |
|----------|-------|
| `APP_KEY` | `php artisan key:generate --show` (must be set) |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://tamcarwash.on-forge.com` |
| `DB_CONNECTION` | `landlord` (not `mysql` alone) |
| `LANDLORD_DB_DRIVER` | `mysql` |
| `LANDLORD_DB_DATABASE` | `tamcarwash_landlord` |
| `TENANT_DB_DRIVER` | `mysql` |
| `TENANT_DB_PREFIX` | `tamcarwash_tenant_` |
| `PLATFORM_DOMAIN` | `tamcarwash.on-forge.com` |
| `TENANCY_PLATFORM_DOMAIN` | `tamcarwash.on-forge.com` |
| `TENANCY_CENTRAL_DOMAINS` | includes `tamcarwash.on-forge.com` |
| `SESSION_DRIVER` | `file` (or `redis` with Redis installed) |
| `CACHE_STORE` | `file` (or `redis`) |
| `SESSION_DOMAIN` | `.tamcarwash.on-forge.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `tamcarwash.on-forge.com,*.tamcarwash.on-forge.com` |

**If the site returns 500 but `/up` and `/api/landlord/v1/health` work**

Web routes use sessions; API/health routes do not. Common causes:

1. **`SESSION_DRIVER=database` without a `sessions` table** — set `SESSION_DRIVER=file` in Forge env, then `php artisan config:clear && php artisan optimize`.
2. **Missing `APP_KEY`** — run `php artisan key:generate --show` and paste into Forge env.
3. **Landlord migrations not run** — run the deploy script migration step (includes `sessions` table when using database sessions).
4. **Stale config cache** — `php artisan config:clear && php artisan optimize`.

Quick diagnostic on the server:

```bash
cd /home/forge/tamcarwash.on-forge.com/current
php artisan about
tail -50 storage/logs/laravel.log
grep SESSION_DRIVER .env
php artisan migrate:status --database=landlord --path=database/migrations/landlord
```

**Deployment script** — copy from [`deploy/forge-deploy.sh`](deploy/forge-deploy.sh) or use:

```bash
cd $FORGE_SITE_PATH

$FORGE_COMPOSER install --no-dev --no-interaction --prefer-dist --optimize-autoloader
npm ci && npm run build

php artisan config:clear
php artisan route:cache
php artisan view:cache

# Platform schema only — do NOT run: php artisan migrate
php artisan migrate --database=landlord --path=database/migrations/landlord --force

php artisan app:seed-production --force

# New tenant migrations for all provisioned tenants
php artisan tenants:migrate

php artisan optimize
```

**Migration layout**

| Path | Purpose |
|------|---------|
| `database/migrations/` | Empty (`.gitkeep` only) — no root migrations |
| `database/migrations/landlord/` | Platform control plane |
| `database/migrations/tenant/` | Business schema (Spatie permissions live here only) |

**If a previous deploy failed on `2026_07_28_015504_create_permission_tables`**

That migration was removed from the repo root in favor of `database/migrations/tenant/2026_07_28_120000_create_permission_tables.php`. After updating the deploy script, redeploy. If the legacy `tamcarwash` database still has orphan `permissions` tables from an old default-connection migrate, point the app at `tamcarwash_landlord` via env vars above; tenant permissions are created per tenant during provisioning / `tenants:migrate`.

---

## Laravel Forge scheduled jobs

Add these in Forge → Scheduled Jobs (user: `forge`):

| Job | Frequency | Command |
|-----|-----------|---------|
| Tenant lifecycle | Weekly | `php /home/forge/tamcarwash.on-forge.com/current/artisan tenants:process-scheduled` |
| Tenant health | Daily | `php /home/forge/tamcarwash.on-forge.com/current/artisan tenants:health-check` |

Optional monitoring heartbeat — set `FORGE_HEARTBEAT_URL` in Forge env or pass `--heartbeat-url=`:

```bash
php /home/forge/tamcarwash.on-forge.com/current/artisan tenants:process-scheduled --heartbeat-url=https://your-heartbeat-url
php /home/forge/tamcarwash.on-forge.com/current/artisan landlord:report-subscriptions
```

`tenants:process-scheduled` retries stuck provisioning, expires trials, marks overdue subscriptions, and logs a summary. Use `--dry-run` to preview.

The same jobs are registered in `routes/console.php` via Laravel's scheduler (requires a cron entry: `* * * * * php artisan schedule:run`).

---

## Artisan commands

| Command | Description |
|---------|-------------|
| `tenants:create` | Create and provision a new tenant |
| `tenants:migrate` | Run tenant migrations (all or `--tenant=slug`) |
| `tenants:seed` | Run tenant seeders |
| `tenants:refresh-cache` | Rebuild tenant resolution cache |
| `tenants:run-scheduled` | Run scheduled tasks per tenant |
| `tenants:process-scheduled` | Retry provisioning, expire trials, mark overdue subscriptions |
| `tenants:health-check` | Verify tenant DB connectivity |
| `landlord:report-subscriptions` | Platform subscription summary for monitoring |
| `app:seed-production` | Idempotent landlord + optional tenant seeders |

All seeders use `updateOrCreate` / `firstOrCreate` — safe to rerun, never truncates.

---

## Frontend (React inside Laravel)

React 19 lives in `resources/js/` — no separate frontend app.

```
resources/js/
├── app.tsx              # Vite entry
├── main.tsx             # React bootstrap + providers
├── components/ui/       # shadcn/ui (Radix + Tailwind)
├── pages/               # Module pages (dashboard, branches, queue…)
├── lib/i18n/ar.ts       # Arabic-first strings
└── lib/api.ts           # Sanctum-aware API client
```

```bash
npm run dev      # Vite dev server
npm run build    # Production build → public/build/
npm run typecheck
```

SPA routes are served via catch-all in `routes/web.php` → `resources/views/app.blade.php`.

**`/` (home)** and all non-API browser paths load the React SPA (login/dashboard), not Laravel’s default `welcome` view.

---

## API overview

**Tenant API** — `/api/v1/*` (requires tenant context)

- `POST /auth/login` · `GET /auth/user`
- `GET /dashboard/stats` — real aggregations (orders, revenue, queue, bookings)
- CRUD: branches, customers, vehicles, services, pricing, bookings, queue, orders, invoices

**Landlord API** — `/api/landlord/v1/*` (requires `auth:platform`)

- `POST /auth/login` · `GET /auth/user` · `POST /auth/logout`
- `GET /dashboard/stats` — tenants, trials, MRR, plan breakdown
- `GET /tenants` · `GET /tenants/{id}` · `PATCH /tenants/{id}` (suspend/activate)
- `GET /plans` · `GET /subscriptions` · `GET|PUT /settings`
- `POST /tenants/register` — public tenant signup

**Landlord UI (React):** `/landlord/login`, `/landlord/dashboard`, `/landlord/tenants`, `/landlord/subscriptions`, `/landlord/plans`, `/landlord/settings`

Auth: Laravel Sanctum (`auth:tenant` / `auth:platform` guards).

---

## Oman VAT

- Default rate: **5%** (seeded via `OmanVatSeeder`)
- Tax-inclusive and tax-exclusive pricing support
- Invoice fields: subtotal, VAT, total, VATIN, CR number, QR code
- Tax reports via `TaxReportController`

---

## Octane + RoadRunner (production)

```bash
# Install RoadRunner binary
php artisan octane:install --server=roadrunner

# Run (development)
php artisan octane:start --watch

# Production (behind nginx)
php artisan octane:start --server=roadrunner --host=0.0.0.0 --port=8000 --workers=4
```

Configure Redis for cache, sessions, and queues in production. Set `QUEUE_CONNECTION=redis`.

---

## Environment variables

See `.env.example` for full reference. Key settings:

| Variable | Local (SQLite) | Production (MySQL) |
|----------|----------------|---------------------|
| `LANDLORD_DB_DRIVER` | `sqlite` | `mysql` |
| `LANDLORD_DB_DATABASE` | path to `database/landlord.sqlite` | `tamcarwash_landlord` |
| `TENANT_DB_DRIVER` | `sqlite` | `mysql` |
| `TENANT_SQLITE_DIRECTORY` | `database/tenants/` | — |
| `TENANT_DB_PREFIX` | — | `tamcarwash_tenant_` |
| `TENANCY_PLATFORM_DOMAIN` / `PLATFORM_DOMAIN` | `tamcarwash.test` | production domain |
| `TENANCY_SUBDIRECTORY_ENABLED` | `true` | enable `/{slug}/*` tenant URLs |
| `TENANCY_CENTRAL_DOMAINS` | includes platform host | hosts without subdomain tenant |
| `FORGE_HEARTBEAT_URL` | optional | Forge/monitoring ping after scheduled jobs |
| `CACHE_STORE` / `SESSION_DRIVER` | `file` | `file` (or `redis` when Redis is configured) |

---

## Packages

| Package | Purpose |
|---------|---------|
| `laravel/sanctum` | API token auth |
| `spatie/laravel-permission` | Roles & permissions |
| `spatie/laravel-activitylog` | Audit trail |
| `spatie/laravel-settings` | Typed settings |
| `spatie/laravel-medialibrary` | Media uploads |
| `spatie/laravel-query-builder` | Filterable API queries |
| `maatwebsite/excel` | Excel export |
| `barryvdh/laravel-dompdf` | Invoice PDF |
| `predis/predis` | Redis client |
| `laravel/octane` | High-performance runtime |

---

## Order status flow

```
pending → checked_in → queued → in_service → quality_check → ready → completed
                                                                    ↘ cancelled
```

---

## License

MIT
