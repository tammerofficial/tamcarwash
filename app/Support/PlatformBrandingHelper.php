<?php

namespace App\Support;

use App\Models\Landlord\Tenant;
use App\Services\Landlord\PlatformSettingsService;

class PlatformBrandingHelper
{
    /**
     * @return array{name: string, tagline: string}
     */
    public static function defaults(): array
    {
        return [
            'name' => config('tammer.platform.name', 'تمير واش'),
            'tagline' => config('tammer.platform.tagline', 'Enterprise SaaS'),
        ];
    }

    /**
     * @return array{name: string, tagline: string}
     */
    public static function resolvePlatform(?PlatformSettingsService $settings = null): array
    {
        try {
            $settings ??= app(PlatformSettingsService::class);

            return [
                'name' => (string) $settings->get('platform_name', self::defaults()['name']),
                'tagline' => (string) $settings->get('platform_tagline', self::defaults()['tagline']),
            ];
        } catch (\Throwable) {
            return self::defaults();
        }
    }

    /**
     * Resolved branding for the current page context (injected into window.__TAMMER__).
     *
     * @return array{
     *     appName: string,
     *     tagline: string|null,
     *     platform: array{name: string, tagline: string}
     * }
     */
    public static function resolveForContext(?Tenant $tenant, bool $isLandlord): array
    {
        $platform = self::resolvePlatform();

        if ($tenant !== null && ! $isLandlord) {
            $settings = is_array($tenant->settings ?? null) ? $tenant->settings : [];
            $tagline = $settings['tagline'] ?? null;

            return [
                'appName' => $tenant->name,
                'tagline' => filled($tagline) ? (string) $tagline : null,
                'platform' => $platform,
            ];
        }

        return [
            'appName' => $platform['name'],
            'tagline' => $platform['tagline'],
            'platform' => $platform,
        ];
    }

    public static function documentTitle(?Tenant $tenant, bool $isLandlord): string
    {
        $branding = self::resolveForContext($tenant, $isLandlord);

        if (filled($branding['tagline'])) {
            return "{$branding['appName']} — {$branding['tagline']}";
        }

        return $branding['appName'];
    }
}
