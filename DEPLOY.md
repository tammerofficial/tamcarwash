# Tammer Wash — Laravel Forge Deployment

## Forge → Site → Deployment Script

انسخ هذا في **Forge → Site → Deployment Script** ثم فعّل **Quick Deploy**:

```bash
cd $FORGE_SITE_PATH
git pull origin $FORGE_SITE_BRANCH
bash deploy/forge-deploy.sh
```

## ماذا يحدث تلقائياً عند كل Push / Deploy؟

| الخطوة | الأمر |
|--------|-------|
| Composer | `composer install --no-dev` |
| Frontend | `npm ci && npm run build` |
| Landlord migrations | `php artisan migrate --database=landlord --path=database/migrations/landlord --force` |
| Tenant migrations | `php artisan tenants:migrate` |
| Production seeders | `php artisan db:seed --class=ProductionSeeder --force` |
| Cache | `config:cache`, `route:cache`, `view:cache` |

الـ seeders **idempotent** — آمنة للتكرار في كل deploy (لا تحذف بيانات).

## Forge → Site → Environment (الحد الأدنى)

```env
DB_CONNECTION=landlord
DB_HOST=your-cluster.db.on-forge.com
DB_PORT=25060
DB_USERNAME=doadmin
DB_PASSWORD=your-password
DB_DATABASE=tamcarwash

MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt
MYSQL_SSL_VERIFY_SERVER_CERT=false

LANDLORD_DB_DATABASE=tamcarwash_landlord
TENANT_DB_PREFIX=tamcarwash_tenant_

LANDLORD_ADMIN_EMAIL=you@example.com
LANDLORD_ADMIN_PASSWORD=strong-password
LANDLORD_ADMIN_NAME=مدير المنصة
LANDLORD_ADMIN_ROLE=admin
```

**SQL مرة واحدة على الكلستر:**

```sql
CREATE DATABASE IF NOT EXISTS tamcarwash_landlord
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## تسجيل مغسلة جديدة

عند التسجيل من `/register` يُنشأ تلقائياً:

- قاعدة `tamcarwash_tenant_{slug}`
- migrations + seed + تفعيل الحساب

## Super admin

- **URL:** `/landlord/login`
- **Seeder:** `PlatformUserSeeder` (ضمن `ProductionSeeder`)

## Quick Deploy

Forge → Site → **Enable Quick Deploy** — عند كل push على GitHub يُشغَّل `deploy/forge-deploy.sh` تلقائياً.
