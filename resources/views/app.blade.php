@php
    use App\Models\Landlord\Tenant;
    use App\Services\Landlord\PlatformSettingsService;
    use App\Support\BrandingHelper;
    use App\Support\PlatformBrandingHelper;

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
                        ->first(['id', 'name', 'slug', 'email', 'phone', 'settings', 'metadata']);
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
                    ->first(['id', 'name', 'slug', 'email', 'phone', 'settings', 'metadata']);
            }
        } catch (\Throwable) {
            // Landlord DB may be unavailable during local setup.
        }
    }

    $tenancyMode = 'subdirectory';

    try {
        $tenancyMode = app(PlatformSettingsService::class)->tenancyMode();
    } catch (\Throwable) {
        $tenancyMode = config('tenancy.subdirectory_enabled', false) ? 'subdirectory' : 'subdomain';
    }

    $tenantBranding = null;

    if ($tenant) {
        $tenantSettings = is_array($tenant->settings ?? null) ? $tenant->settings : [];
        $tenantMetadata = is_array($tenant->metadata ?? null) ? $tenant->metadata : [];
        $tenantBranding = BrandingHelper::resolve($tenantSettings, $tenantMetadata);
    }

    $tenantPayload = $tenant ? [
        'id' => $tenant->id,
        'name' => $tenant->name,
        'slug' => $tenant->slug,
        'email' => $tenant->email,
        'phone' => $tenant->phone ?: config('tammer.contact.phone', '+965 18XXXXXX'),
        'branding' => $tenantBranding,
    ] : null;

    $defaultContact = [
        'phone' => config('tammer.contact.phone', '+965 18XXXXXX'),
        'address' => config('tammer.contact.address', 'العاصمة ، الكويت'),
    ];

    $brandingContext = PlatformBrandingHelper::resolveForContext($tenant, $isLandlord);
@endphp
<!DOCTYPE html>
<html lang="ar" dir="rtl"@if($tenant) data-tenant="{{ $tenant->slug }}"@endif>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ rescue(fn () => csrf_token(), '') }}">

        <title>{{ PlatformBrandingHelper::documentTitle($tenant, $isLandlord) }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=ibm-plex-sans-arabic:400,500,600,700" rel="stylesheet" />

        <script>
            window.__TAMMER__ = {
                appName: @json($brandingContext['appName']),
                tagline: @json($brandingContext['tagline']),
                platform: @json($brandingContext['platform']),
                apiBaseUrl: @json(url('/api/v1')),
                landlordApiBaseUrl: @json(url('/api/landlord/v1')),
                sanctumUrl: @json(url('/sanctum/csrf-cookie')),
                csrfToken: @json(rescue(fn () => csrf_token(), '')),
                isLandlord: @json($isLandlord),
                tenant: @json($tenantPayload),
                tenancyMode: @json($tenancyMode),
                subdirectoryEnabled: @json(config('tenancy.subdirectory_enabled', false)),
                reservedPaths: @json(config('tenancy.reserved_paths', [])),
                subdirectorySlug: @json($subdirectorySlug),
                allowQuickLogin: @json(config('tenancy.allow_quick_login')),
                platformDomain: @json(config('tenancy.platform_domain')),
                defaultContact: @json($defaultContact),
            };
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.tsx'])

        @if(isset($tenantPayload['branding']))
            <style>
                html[data-tenant] {
                    {!! BrandingHelper::cssVariables($tenantPayload['branding']) !!}
                }
            </style>
        @endif
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
