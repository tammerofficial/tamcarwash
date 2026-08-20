<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

/*
| SPA entry: all browser routes (including /) serve resources/views/app.blade.php.
| Session/CSRF middleware is skipped so the shell loads even when server session
| storage is misconfigured; Sanctum CSRF is fetched client-side before login.
*/
Route::view('/{any?}', 'app')
    ->where('any', '^(?!api(?:/|$)|sanctum(?:/|$)|up$|ping$|build(?:/|$)).*')
    ->withoutMiddleware([
        EncryptCookies::class,
        StartSession::class,
        ShareErrorsFromSession::class,
        ValidateCsrfToken::class,
    ])
    ->name('spa');
