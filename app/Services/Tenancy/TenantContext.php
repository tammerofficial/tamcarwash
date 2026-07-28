<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;

class TenantContext
{
    protected ?Tenant $tenant = null;

    protected bool $initialized = false;

    public function set(Tenant $tenant): void
    {
        $this->tenant = $tenant;
        $this->initialized = true;
    }

    public function get(): ?Tenant
    {
        return $this->tenant;
    }

    public function id(): ?string
    {
        return $this->tenant?->id;
    }

    public function slug(): ?string
    {
        return $this->tenant?->slug;
    }

    public function isInitialized(): bool
    {
        return $this->initialized && $this->tenant !== null;
    }

    public function forget(): void
    {
        $this->tenant = null;
        $this->initialized = false;
    }
}
