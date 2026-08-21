<?php

namespace App\Support;

class PlanFeatureCatalog
{
    public const KEYS = [
        'dashboard',
        'cashier',
        'worker',
        'queue',
        'queue_screen',
        'orders',
        'bookings',
        'branches',
        'customers',
        'vehicles',
        'services',
        'pricing',
        'invoices',
        'tax_reports',
        'appearance',
        'settings',
    ];

    /**
     * Legacy feature strings stored as a list on older plans.
     *
     * @var array<string, string>
     */
    public const ALIASES = [
        'booking' => 'bookings',
        'vat_reports' => 'tax_reports',
        'basic_reports' => 'tax_reports',
        'advanced_reports' => 'tax_reports',
        'queue-screen' => 'queue_screen',
        'queueScreen' => 'queue_screen',
        'tax-reports' => 'tax_reports',
    ];

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return self::KEYS;
    }

    /**
     * @return array<string, bool>
     */
    public static function emptyMap(): array
    {
        return array_fill_keys(self::KEYS, false);
    }

    /**
     * @return array<string, bool>
     */
    public static function allEnabled(): array
    {
        return array_fill_keys(self::KEYS, true);
    }

    /**
     * Starter / free — core daily operations.
     *
     * @return array<string, bool>
     */
    public static function starterDefaults(): array
    {
        return self::mapFromEnabled([
            'dashboard',
            'cashier',
            'worker',
            'queue',
            'queue_screen',
            'orders',
            'branches',
            'customers',
            'vehicles',
            'services',
            'pricing',
            'settings',
        ]);
    }

    /**
     * Professional — core plus bookings, invoices, tax, appearance.
     *
     * @return array<string, bool>
     */
    public static function professionalDefaults(): array
    {
        return self::mapFromEnabled([
            'dashboard',
            'cashier',
            'worker',
            'queue',
            'queue_screen',
            'orders',
            'bookings',
            'branches',
            'customers',
            'vehicles',
            'services',
            'pricing',
            'invoices',
            'tax_reports',
            'appearance',
            'settings',
        ]);
    }

    /**
     * @return array<string, bool>
     */
    public static function enterpriseDefaults(): array
    {
        return self::allEnabled();
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultsForSlug(?string $slug): array
    {
        return match ($slug) {
            'professional', 'pro' => self::professionalDefaults(),
            'enterprise', 'business' => self::enterpriseDefaults(),
            default => self::starterDefaults(),
        };
    }

    /**
     * Normalize stored JSON (legacy string list or boolean map) into a full catalog map.
     *
     * @param  array<int|string, mixed>|null  $features
     * @return array<string, bool>
     */
    public static function normalize(?array $features, ?string $slug = null): array
    {
        $defaults = $slug ? self::defaultsForSlug($slug) : self::emptyMap();

        if ($features === null || $features === []) {
            return $slug ? $defaults : self::emptyMap();
        }

        if (self::isList($features)) {
            $map = $slug ? $defaults : self::emptyMap();

            foreach ($features as $raw) {
                $key = self::canonicalKey((string) $raw);

                if ($key !== null) {
                    $map[$key] = true;
                }
            }

            return self::fill($map);
        }

        $map = self::emptyMap();

        foreach ($features as $rawKey => $value) {
            $key = self::canonicalKey((string) $rawKey);

            if ($key !== null) {
                $map[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }
        }

        return $map;
    }

    /**
     * @param  array<int|string, mixed>|null  $features
     */
    public static function enabled(?array $features, string $key, ?string $slug = null): bool
    {
        $canonical = self::canonicalKey($key);

        if ($canonical === null) {
            return false;
        }

        return self::normalize($features, $slug)[$canonical] ?? false;
    }

    public static function canonicalKey(string $key): ?string
    {
        $key = trim($key);

        if ($key === '') {
            return null;
        }

        if (isset(self::ALIASES[$key])) {
            return self::ALIASES[$key];
        }

        return in_array($key, self::KEYS, true) ? $key : null;
    }

    /**
     * @param  array<int, string>  $enabled
     * @return array<string, bool>
     */
    public static function mapFromEnabled(array $enabled): array
    {
        $map = self::emptyMap();

        foreach ($enabled as $key) {
            $canonical = self::canonicalKey($key);

            if ($canonical !== null) {
                $map[$canonical] = true;
            }
        }

        return $map;
    }

    /**
     * @param  array<string, bool>  $map
     * @return array<string, bool>
     */
    public static function fill(array $map): array
    {
        return array_merge(self::emptyMap(), $map);
    }

    /**
     * @param  array<int|string, mixed>  $features
     */
    protected static function isList(array $features): bool
    {
        if ($features === []) {
            return true;
        }

        return array_is_list($features);
    }
}
