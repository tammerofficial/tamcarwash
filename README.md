# Tammer Wash

Production-ready SaaS platform for fixed-location car wash businesses in Oman.

**Stack:** Laravel 13 · PHP 8.3+ · React 19 + TypeScript · Tailwind CSS · shadcn/ui · Sanctum · Spatie packages · Redis · Octane/RoadRunner · MySQL 8.4

---

## Architecture

### Multi-tenancy (database-per-tenant)

| Layer | Connection | Purpose |
|-------|------------|---------|
| **Landlord** | `landlord` | Platform control: tenants, domains, plans, subscriptions, platform users |
| **Tenant** | `tenant` (dynamic) | Isolated business data per car wash — **no `tenant_id` on business tables** |

**Tenant detection:**
1. Subdomain — `{slug}.tamcarwash.test`
2. Custom domain — mapped in `tenant_domains`
3. Super-admin context — `X-Tenant-Id` header or admin session

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

- PHP 8.3+, Composer 2
- Node.js 20+, npm
- Docker & Docker Compose (recommended for MySQL + Redis)

### 2. Clone & install

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
npm run build
```

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts **MySQL 8.4** and **Redis 7**. Default credentials are in `.env.example`.
### Local dev without Docker

If Docker is not running (or you do not need Redis locally), use file-based cache and sessions so the SPA loads without `Connection refused` on port 6379:

```bash
# In .env (do not commit .env)
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
CACHE_STORE=file
TENANT_CACHE_STORE=file

php artisan config:clear
```

With Docker, keep the defaults in `.env.example` (`redis` drivers) and run `docker compose up -d`.



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

- **Tenant SPA:** http://demo.tamcarwash.test:8000
- **Tenant API:** http://demo.tamcarwash.test:8000/api/v1
- **Landlord API:** http://admin.tamcarwash.test:8000/api/landlord/v1

---

## Artisan commands

| Command | Description |
|---------|-------------|
| `tenants:create` | Create and provision a new tenant |
| `tenants:migrate` | Run tenant migrations (all or `--tenant=slug`) |
| `tenants:seed` | Run tenant seeders |
| `tenants:refresh-cache` | Rebuild tenant resolution cache |
| `tenants:run-scheduled` | Run scheduled tasks per tenant |
| `tenants:health-check` | Verify tenant DB connectivity |
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

**Landlord API** — `/api/landlord/v1/*`

- Platform health, tenant management (scaffolded)

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

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_CONNECTION` | `landlord` | Default DB connection |
| `LANDLORD_DB_DATABASE` | `tamcarwash_landlord` | Platform database |
| `TENANT_DB_PREFIX` | `tamcarwash_tenant_` | Tenant DB name prefix |
| `TENANCY_PLATFORM_DOMAIN` | `tamcarwash.test` | Base domain for subdomains |
| `REDIS_CLIENT` | `predis` | Redis client |
| `QUEUE_CONNECTION` | `redis` | Queue driver |

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
