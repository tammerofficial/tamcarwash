# 📋 Tammer Wash - Quick Deployment Checklist

**Last Updated:** August 22, 2026  
**Status:** ✅ Ready for Production

---

## Pre-Deployment Verification (5 min)

- [ ] All E2E tests passed (see E2E_TEST_REPORT.md)
- [ ] Code committed to main branch
- [ ] All files staged and clean
- [ ] Latest version: v73

```bash
git status  # Should show "nothing to commit, working tree clean"
git log --oneline -1  # Should show v73
```

---

## Forge Server Setup (15 min)

### 1. Create New Site on Laravel Forge
- [ ] Server created
- [ ] PHP version: 8.3+
- [ ] Node.js enabled
- [ ] Domain configured
- [ ] SSL certificate requested

### 2. Connect Repository
- [ ] GitHub repo connected
- [ ] Branch: main
- [ ] Auto-deploy disabled (for now)

### 3. Configure Environment
Create `.env` with:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tamcarwash.on-forge.com  # Your domain

# Database
LANDLORD_DB_DRIVER=mysql
LANDLORD_DB_HOST=127.0.0.1
LANDLORD_DB_PORT=3306
LANDLORD_DB_DATABASE=tamcarwash_landlord
LANDLORD_DB_USERNAME=tamcarwash
LANDLORD_DB_PASSWORD=<strong-password>

TENANT_DB_DRIVER=mysql
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=3306
TENANT_DB_USERNAME=tamcarwash
TENANT_DB_PASSWORD=<strong-password>
TENANT_DB_PREFIX=tamcarwash_tenant_

# Caching & Sessions
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Domain Config
PLATFORM_DOMAIN=tamcarwash.on-forge.com
TENANCY_PLATFORM_DOMAIN=tamcarwash.on-forge.com
TENANCY_CENTRAL_DOMAINS=tamcarwash.on-forge.com,*.tamcarwash.on-forge.com
SESSION_DOMAIN=.tamcarwash.on-forge.com
SANCTUM_STATEFUL_DOMAINS=*.tamcarwash.on-forge.com

# Mail (configure your service)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USERNAME=<your-username>
MAIL_PASSWORD=<your-password>
MAIL_FROM_ADDRESS="noreply@tamcarwash.on-forge.com"
MAIL_FROM_NAME="Tammer Wash"
```

---

## Database Setup (5 min)

### On Forge Server

```bash
# 1. Create landlord database
mysql -u root -p
> CREATE DATABASE tamcarwash_landlord;
> EXIT;

# 2. Set file permissions
cd /home/forge/tamcarwash
chmod -R 775 storage bootstrap/cache
chown -R forge:forge storage bootstrap/cache

# 3. Install composer dependencies
composer install --optimize-autoloader --no-dev

# 4. Generate app key
php artisan key:generate

# 5. Run landlord migrations (FIRST TIME ONLY)
php artisan migrate --database=landlord --path=database/migrations/landlord

# 6. Seed production data
php artisan app:seed-production

# 7. Build frontend
npm ci
npm run build

# 8. Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Deployment Script Setup (5 min)

In Forge, set Deploy Script to:

```bash
#!/bin/bash
set -e

# Variables
SITE_PATH=/home/forge/tamcarwash
BRANCH=main

# 1. Pull latest code
cd $SITE_PATH
git pull origin $BRANCH

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Build frontend
cd $SITE_PATH
npm ci
npm run build

# 4. Run migrations for each new tenant
php artisan tenants:migrate

# 5. Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Restart services
php artisan queue:restart
php artisan octane:reload

# 7. Health check
php artisan app:health

echo "✅ Deployment successful"
```

---

## Pre-Launch Verification (10 min)

```bash
# 1. Check configuration
php artisan config:show | head -20

# 2. Check database connection
php artisan db:show --database=landlord

# 3. Check migrations
php artisan migrate:status --database=landlord

# 4. Check routes
php artisan route:list | grep "landlord/v1/health"

# 5. Test health endpoint
curl https://tamcarwash.on-forge.com/api/landlord/v1/health

# 6. Check logs
tail -f storage/logs/laravel.log
```

---

## Launch Steps (5 min)

### Enable Auto-Deploy in Forge
- [ ] Go to site settings
- [ ] Enable "Deploy on Push"
- [ ] Branch: main

### Point Domain to Forge
- [ ] Update DNS records
- [ ] SSL certificate auto-installed
- [ ] Test: https://tamcarwash.on-forge.com

### First Tenant Registration Test
1. Open https://tamcarwash.on-forge.com
2. Click "Register"
3. Fill in:
   - Business Name: "Test Wash"
   - Owner Name: "Test Owner"
   - Email: "test@example.com"
   - Password: (8+ chars)
   - Plan: "Starter"
4. Click "Register"
5. Verify success message
6. Check database:
   ```bash
   mysql -u tamcarwash -p tamcarwash_landlord
   > SELECT slug, status FROM tenants WHERE slug LIKE '%test%';
   > SELECT * FROM tenants LIMIT 1\G
   ```

---

## Post-Launch Verification (10 min)

### Check Logs
```bash
tail -100 storage/logs/laravel.log
# Should show no errors, only info messages
```

### Test Admin Login
1. Visit https://tamcarwash.on-forge.com/landlord/login
2. Enter admin credentials
3. Verify dashboard loads
4. Check tenant list shows new "Test Wash" tenant

### Test Tenant Login
1. Use credentials from registration
2. Verify tenant dashboard loads
3. Check demo data populated
4. Verify orders/invoices visible

### Monitor Dashboard
- [ ] CPU < 30%
- [ ] Memory < 40%
- [ ] Disk space > 20GB
- [ ] Error logs empty
- [ ] Response times < 500ms

---

## Rollback Plan (If Issues)

### Quick Rollback
```bash
# 1. Revert to previous deployment
git revert HEAD
git push origin main

# 2. Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# 3. Force redeployment
# In Forge: Click "Deploy Now"
```

### Full Database Rollback
```bash
# 1. Stop Forge deployment
# 2. Restore from backup
# 3. Re-run migrations if needed
php artisan migrate --database=landlord --path=database/migrations/landlord
```

---

## Post-Deployment Checklist

### Daily (Automated)
- [ ] Backup runs daily (Forge scheduled)
- [ ] Error logs monitored
- [ ] Database backups stored

### Weekly
- [ ] Review error logs
- [ ] Check tenant registration volume
- [ ] Monitor database size
- [ ] Test restoration from backup

### Monthly
- [ ] Review analytics
- [ ] Check system performance
- [ ] Update dependencies
- [ ] Security audit

---

## Monitoring URLs

After deployment, monitor these:

```
Health Checks:
- Admin health: https://tamcarwash.on-forge.com/api/landlord/v1/health
- Tenant health: https://tamcarwash.on-forge.com/api/v1/health

Admin Panel:
- Admin login: https://tamcarwash.on-forge.com/landlord/login
- Admin dashboard: https://tamcarwash.on-forge.com/landlord/dashboard

Tenant Access:
- Marketing page: https://tamcarwash.on-forge.com
- Register: https://tamcarwash.on-forge.com/register
- Tenant login: https://tamcarwash.on-forge.com/{tenant-slug}/login

API Endpoints:
- Landlord API: https://tamcarwash.on-forge.com/api/landlord/v1/*
- Tenant API: https://tamcarwash.on-forge.com/api/v1/*
```

---

## Troubleshooting

### Registration Fails
```bash
# 1. Check migration logs
php artisan tenants:list
tail -50 storage/logs/laravel.log

# 2. Verify database permissions
mysql> SHOW GRANTS FOR 'tamcarwash'@'127.0.0.1';

# 3. Check storage permissions
ls -la storage/
```

### Dashboard Won't Load
```bash
# 1. Check auth session
php artisan auth:clear-resets

# 2. Clear cache
php artisan cache:clear

# 3. Check database connection
php artisan db:show --database=tenant

# 4. View specific error
tail -100 storage/logs/laravel.log | grep -A5 "Error"
```

### Invoices Not Generating
```bash
# 1. Check finance module
php artisan tinker
> $tenant = \App\Models\Landlord\Tenant::first();
> $connectionManager->connect($tenant);
> \App\Modules\Finance\Models\Invoice::count();
```

---

## Support Contacts

- **Technical Issues:** Check `storage/logs/laravel.log`
- **Database Issues:** Connect to Forge MySQL via SSH
- **SSL Issues:** Check Forge certificate status
- **Performance Issues:** Check Forge dashboard > Monitoring

---

## Emergency Contacts

In case of critical issues:

1. **SSH into Forge Server:**
   ```bash
   ssh forge@tamcarwash.on-forge.com
   ```

2. **Restart Services:**
   ```bash
   sudo systemctl restart php8.3-fpm
   sudo systemctl restart nginx
   redis-cli FLUSHALL
   ```

3. **Check Logs:**
   ```bash
   tail -f /home/forge/tamcarwash/storage/logs/laravel.log
   ```

---

## Success Indicators

After deployment, you should see:

✅ **Homepage loads** - Marketing page visible  
✅ **Registration works** - Can create test tenant  
✅ **Tenant provision** - Database created automatically  
✅ **Admin login** - Can access admin panel  
✅ **Tenant login** - Owner can login to dashboard  
✅ **Orders visible** - Demo data populated  
✅ **Invoices work** - Can generate invoices  
✅ **API responds** - Health check returns 200  

---

## Final Checklist Before Handing to Customer

- [ ] System running smoothly for 24 hours
- [ ] No errors in logs
- [ ] All features tested end-to-end
- [ ] Customer credentials prepared
- [ ] Support documentation provided
- [ ] Training session scheduled
- [ ] Backup verified working
- [ ] Monitoring alerts configured

---

**✅ Ready to Deploy!**

**Timeline Estimate:**
- Setup: 15 min
- Database: 5 min
- Deployment: 5 min
- Verification: 10 min
- **Total: ~35 minutes**

**Go-Live Time:** 5 minutes (DNS + SSL)

---

*Document Version: 1.0*  
*Last Updated: 2026-08-22*  
*Status: ✅ APPROVED*
