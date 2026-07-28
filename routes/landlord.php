<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Landlord (Platform) API Routes
|--------------------------------------------------------------------------
|
| Platform administration, tenant management, billing, and platform auth.
| Uses landlord database connection and platform Sanctum guard.
|
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'context' => 'landlord',
]));

Route::prefix('auth')->group(function () {
    // PlatformUser login/register endpoints — Agent 2/3 will implement controllers
});

Route::middleware('auth:platform')->group(function () {
    Route::get('/me', fn () => response()->json([
        'user' => auth('platform')->user(),
        'context' => 'landlord',
    ]));

    // Tenant management, plans, subscriptions — future agents
});

Route::prefix('admin')->middleware(['auth:platform', 'tenant.admin'])->group(function () {
    // Platform admin acting on behalf of a tenant via X-Tenant-Id header
});
