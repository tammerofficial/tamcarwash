<?php

namespace App\Providers;

use App\Console\Commands\SeedProductionCommand;
use App\Modules\Finance\Providers\FinanceServiceProvider;
use App\Modules\OperationsServiceProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->register(OperationsServiceProvider::class);
        $this->app->register(FinanceServiceProvider::class);
        $this->app->register(\App\Modules\CoreBusinessServiceProvider::class);

        if ($this->app->runningInConsole()) {
            $this->commands([
                SeedProductionCommand::class,
            ]);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
