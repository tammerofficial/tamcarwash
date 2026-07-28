<?php

namespace App\Modules\Vehicles\Models;

use App\Modules\Customers\Models\Customer;
use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends TenantModel
{
    protected $fillable = [
        'name',
        'contact_name',
        'phone',
        'email',
        'tax_number',
        'address',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
