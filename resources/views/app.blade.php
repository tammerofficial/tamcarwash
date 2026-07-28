<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Tammer Wash') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=ibm-plex-sans-arabic:400,500,600,700" rel="stylesheet" />

        @php
            use App\Models\Landlord\Tenant;

            $host = request()->getHost();
            $isLandlord = str_starts_with($host, 'admin.')
                || str_starts_with($host, 'platform.')
                || str_starts_with($host, 'landlord.');
            $defaultTenantSlug = config('tenancy.local_default_tenant_slug', 'demo');
            $tenant = null;

            if (! $isLandlord) {
                $platformDomain = config('tenancy.platform_domain');
                $centralDomains = config('tenancy.central_domains', []);

                try {
                    if (str_ends_with($host, ".{$platformDomain}")) {
                        $subdomain = str_replace(".{$platformDomain}", '', $host);

                        if (filled($subdomain) && ! in_array($subdomain, ['www', 'api', 'admin'], true)) {
                            $tenant = Tenant::query()
                                ->where('slug', $subdomain)
                                ->first(['id', 'name', 'slug']);
                        }
                    }

                    if (! $tenant && app()->environment('local') && in_array($host, $centralDomains, true)) {
                        $tenant = Tenant::query()
                            ->where('slug', $defaultTenantSlug)
                            ->first(['id', 'name', 'slug']);
                    }
                } catch (\Throwable) {
                    // Landlord DB may be unavailable during local setup.
                }
            }
        @endphp

        <script>
            window.__TAMMER__ = {
                appName: @json(config('app.name', 'Tammer Wash')),
                apiBaseUrl: @json(url('/api/v1')),
                landlordApiBaseUrl: @json(url('/api/landlord/v1')),
                sanctumUrl: @json(url('/sanctum/csrf-cookie')),
                csrfToken: @json(csrf_token()),
                isLandlord: @json($isLandlord),
                tenant: @json($tenant),
                defaultTenantSlug: @json(! $isLandlord && app()->environment('local') ? $defaultTenantSlug : null),
                allowQuickLogin: @json(app()->environment('local')),
            };
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
