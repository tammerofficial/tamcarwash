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
            use App\Services\Landlord\PlatformSettingsService;

            $host = request()->getHost();
            $path = trim(request()->path(), '/');
            $firstSegment = str($path)->before('/')->toString();
            $reservedPaths = config('tenancy.reserved_paths', []);
            $platformDomain = config('tenancy.platform_domain');
            $centralDomains = config('tenancy.central_domains', []);

            $isLandlord = str_starts_with($path, 'landlord')
                || str_starts_with($host, 'admin.')
                || str_starts_with($host, 'platform.')
                || str_starts_with($host, 'landlord.');

            $tenant = null;
            $subdirectorySlug = null;

            if (! $isLandlord) {
                try {
                    if (str_ends_with($host, ".{$platformDomain}")) {
                        $subdomain = str_replace(".{$platformDomain}", '', $host);

                        if (filled($subdomain) && ! in_array($subdomain, ['www', 'api', 'admin', 'landlord', 'platform'], true)) {
                            $tenant = Tenant::query()
                                ->where('slug', $subdomain)
                                ->first(['id', 'name', 'slug']);
                        }
                    }

                    if (
                        ! $tenant
                        && config('tenancy.subdirectory_enabled', false)
                        && in_array($host, $centralDomains, true)
                        && filled($firstSegment)
                        && ! in_array(strtolower($firstSegment), $reservedPaths, true)
                    ) {
                        $subdirectorySlug = strtolower($firstSegment);
                        $tenant = Tenant::query()
                            ->where('slug', $subdirectorySlug)
                            ->first(['id', 'name', 'slug']);
                    }
                } catch (\Throwable) {
                    // Landlord DB may be unavailable during local setup.
                }
            }

            if (! $isLandlord && ! $tenant && in_array($host, $centralDomains, true) && blank($path)) {
                $isLandlord = true;
            }

            $tenancyMode = 'subdirectory';

            try {
                $tenancyMode = app(PlatformSettingsService::class)->tenancyMode();
            } catch (\Throwable) {
                $tenancyMode = config('tenancy.subdirectory_enabled', false) ? 'subdirectory' : 'subdomain';
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
                tenancyMode: @json($tenancyMode),
                subdirectoryEnabled: @json(config('tenancy.subdirectory_enabled', false)),
                reservedPaths: @json(config('tenancy.reserved_paths', [])),
                subdirectorySlug: @json($subdirectorySlug),
                allowQuickLogin: @json(app()->environment('local')),
                platformDomain: @json(config('tenancy.platform_domain')),
            };
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
