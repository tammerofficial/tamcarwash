<?php

namespace App\Providers;

use App\Services\Landlord\PlatformSettingsService;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantContext;
use App\Services\Tenancy\TenantMigrationRunner;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class TenancyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            base_path('config/tenancy.php'),
            'tenancy'
        );

        $this->app->singleton(TenantContext::class);
        $this->app->singleton(TenantConnectionManager::class);
        $this->app->singleton(TenantMigrationRunner::class);
        $this->app->singleton(TenantProvisioningService::class);
    }

    public function boot(): void
    {
        $this->applyPlatformTenancySettings();
    }

    protected function applyPlatformTenancySettings(): void
    {
        try {
            if (! Schema::connection('landlord')->hasTable('platform_settings')) {
                return;
            }

            $this->app->make(PlatformSettingsService::class)->applyTenancyConfig();
        } catch (\Throwable) {
            // Landlord DB may be unavailable during setup or migrations.
        }
    }
}
