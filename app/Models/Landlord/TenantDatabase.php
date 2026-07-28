<?php

namespace App\Models\Landlord;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantDatabase extends Model
{
    use HasUuids;

    protected $connection = 'landlord';

    protected $fillable = [
        'tenant_id',
        'database_name',
        'host',
        'port',
        'username',
        'password',
        'connection_name',
        'status',
        'provisioned_at',
        'migration_batch',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'provisioned_at' => 'datetime',
            'password' => 'encrypted',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }
}
