<?php

namespace App\Support;

use App\Models\Landlord\Tenant;

class BrandingHelper
{
    public const DEFAULT_PRIMARY = '#0f172a';

    public const DEFAULT_SECONDARY = '#0d9488';

    public const DEFAULT_PRIMARY_DARK = '#020617';

    public static function defaults(): array
    {
        return config('tammer.branding', [
            'primary_color' => self::DEFAULT_PRIMARY,
            'secondary_color' => self::DEFAULT_SECONDARY,
        ]);
    }

    public static function resolve(array $settings = [], array $metadata = []): array
    {
        $defaults = self::defaults();

        return [
            'logo_url' => $settings['logo_url'] ?? $metadata['logo_url'] ?? null,
            'primary_color' => $settings['primary_color'] ?? $metadata['primary_color'] ?? $defaults['primary_color'],
            'secondary_color' => $settings['secondary_color'] ?? $metadata['secondary_color'] ?? $defaults['secondary_color'],
            'tagline' => $settings['tagline'] ?? $metadata['tagline'] ?? null,
            'about' => $settings['about'] ?? $metadata['about'] ?? null,
            'social' => $settings['social'] ?? $metadata['social'] ?? [],
        ];
    }

    /**
     * Flat public payload for mobile clients (Flutter) and CDN-friendly JSON.
     *
     * @return array{
     *     tenant_slug: string,
     *     business_name: string,
     *     primary_color: string,
     *     secondary_color: string,
     *     primary_color_dark: string,
     *     logo_url: string|null,
     *     tagline: string|null,
     *     about: string|null,
     *     social: array<string, string>
     * }
     */
    public static function publicPayload(Tenant $tenant): array
    {
        $settings = $tenant->settings ?? [];
        $metadata = $tenant->metadata ?? [];
        $branding = self::resolve($settings, $metadata);
        $primary = $branding['primary_color'] ?? self::DEFAULT_PRIMARY;

        return [
            'tenant_slug' => $tenant->slug,
            'business_name' => $tenant->name,
            'primary_color' => $primary,
            'secondary_color' => $branding['secondary_color'] ?? self::DEFAULT_SECONDARY,
            'primary_color_dark' => self::darkenHex($primary),
            'logo_url' => $branding['logo_url'],
            'tagline' => $branding['tagline'],
            'about' => $branding['about'],
            'social' => $branding['social'] ?? [],
        ];
    }

    public static function darkenHex(string $hex, float $amount = 0.35): string
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $red = (int) round(hexdec(substr($hex, 0, 2)) * (1 - $amount));
        $green = (int) round(hexdec(substr($hex, 2, 2)) * (1 - $amount));
        $blue = (int) round(hexdec(substr($hex, 4, 2)) * (1 - $amount));

        return sprintf('#%02x%02x%02x', $red, $green, $blue);
    }

    public static function hexToHslComponents(string $hex): string
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $red = hexdec(substr($hex, 0, 2)) / 255;
        $green = hexdec(substr($hex, 2, 2)) / 255;
        $blue = hexdec(substr($hex, 4, 2)) / 255;

        $max = max($red, $green, $blue);
        $min = min($red, $green, $blue);
        $lightness = ($max + $min) / 2;

        if ($max === $min) {
            $hue = 0;
            $saturation = 0;
        } else {
            $delta = $max - $min;
            $saturation = $lightness > 0.5
                ? $delta / (2 - $max - $min)
                : $delta / ($max + $min);

            $hue = match ($max) {
                $red => fmod((($green - $blue) / $delta) + ($green < $blue ? 6 : 0), 6),
                $green => (($blue - $red) / $delta) + 2,
                default => (($red - $green) / $delta) + 4,
            } * 60;
        }

        return sprintf(
            '%d %d%% %d%%',
            (int) round($hue),
            (int) round($saturation * 100),
            (int) round($lightness * 100),
        );
    }

    public static function cssVariables(array $branding): string
    {
        $primary = $branding['primary_color'] ?? self::DEFAULT_PRIMARY;
        $secondary = $branding['secondary_color'] ?? self::DEFAULT_SECONDARY;
        $primaryHsl = self::hexToHslComponents($primary);
        $secondaryHsl = self::hexToHslComponents($secondary);

        return implode("\n", [
            "--brand-primary: {$primary};",
            "--brand-secondary: {$secondary};",
            '--brand-primary-dark: '.self::darkenHex($primary).';',
            "--primary: {$primaryHsl};",
            "--ring: {$primaryHsl};",
            "--accent: {$secondaryHsl};",
            "--admin-sidebar-active: {$primaryHsl};",
        ]);
    }
}
