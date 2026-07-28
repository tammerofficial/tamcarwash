<?php

namespace App\Services\Landlord;

use App\Models\Landlord\PlatformSetting;
use Illuminate\Support\Facades\Cache;

class PlatformSettingsService
{
    protected const CACHE_KEY = 'landlord.platform_settings';

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, 300, function () {
            $stored = PlatformSetting::query()->pluck('value', 'key')->all();

            return array_merge($this->defaults(), $stored);
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    public function update(array $settings): array
    {
        foreach ($settings as $key => $value) {
            if (! array_key_exists($key, $this->defaults())) {
                continue;
            }

            PlatformSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        Cache::forget(self::CACHE_KEY);

        return $this->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function defaults(): array
    {
        return [
            'platform_name' => config('app.name', 'Tammer Wash'),
            'platform_domain' => config('tenancy.platform_domain'),
            'trial_days' => 14,
            'support_email' => config('mail.from.address'),
        ];
    }
}
