<?php

namespace App\Modules\Analytics;

use App\Modules\Analytics\Http\Controllers\AnalyticsController;
use Illuminate\Support\Facades\Route;

class AnalyticsModule
{
    public static function registerRoutes(): void
    {
        Route::prefix('api/tenant')
            ->middleware('api')
            ->group(function () {
                Route::middleware('auth:sanctum')
                    ->prefix('analytics')
                    ->group(function () {
                        Route::get('/executive-summary', [AnalyticsController::class, 'executiveSummary']);
                        Route::get('/revenue', [AnalyticsController::class, 'revenueAnalytics']);
                        Route::get('/customers', [AnalyticsController::class, 'customerAnalytics']);
                        Route::get('/operations', [AnalyticsController::class, 'operationsAnalytics']);
                        Route::get('/financial', [AnalyticsController::class, 'financialReports']);
                        Route::get('/staff-performance', [AnalyticsController::class, 'staffPerformance']);
                        Route::get('/loyalty-retention', [AnalyticsController::class, 'loyaltyRetention']);
                        Route::get('/comprehensive-dashboard', [AnalyticsController::class, 'comprehensiveDashboard']);
                    });
            });
    }
}
