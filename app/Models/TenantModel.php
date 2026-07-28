<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Base model for all per-tenant business data.
 *
 * Isolation is enforced by a separate database per tenant — never add tenant_id
 * to business tables. Always use the dedicated tenant connection.
 */
abstract class TenantModel extends Model
{
    protected $connection = 'tenant';
}
