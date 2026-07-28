<?php

use Illuminate\Support\Facades\Route;

/*
| SPA entry: all browser routes (including /) serve resources/views/app.blade.php.
| Laravel's default welcome view is not registered here.
*/
Route::view('/{any?}', 'app')
    ->where('any', '^(?!api(?:/|$)|sanctum(?:/|$)|up$|build(?:/|$)).*')
    ->name('spa');
