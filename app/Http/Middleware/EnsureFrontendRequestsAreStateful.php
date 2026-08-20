<?php

namespace App\Http\Middleware;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumEnsureFrontendRequestsAreStateful;
use Laravel\Sanctum\Sanctum;

class EnsureFrontendRequestsAreStateful extends SanctumEnsureFrontendRequestsAreStateful
{
    /**
     * Treat same-host SPA/API requests as stateful even when Referer/Origin is absent
     * (e.g. fetch from dashboard, curl, strict referrer policies).
     */
    public static function fromFrontend($request): bool
    {
        if (static::requestHostIsStateful($request)) {
            return true;
        }

        return parent::fromFrontend($request);
    }

    protected static function requestHostIsStateful($request): bool
    {
        $host = $request->getHttpHost();

        $stateful = Collection::make(config('sanctum.stateful', []))
            ->map(fn (string $domain) => trim($domain))
            ->filter()
            ->reject(fn (string $domain) => $domain === Sanctum::$currentRequestHostPlaceholder)
            ->map(fn (string $domain) => Str::contains($domain, '*') ? $domain : "{$domain}/*")
            ->all();

        return Str::is($stateful, "{$host}/");
    }
}
