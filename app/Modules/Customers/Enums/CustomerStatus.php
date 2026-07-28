<?php

namespace App\Modules\Customers\Enums;

enum CustomerStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Blacklisted = 'blacklisted';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'نشط',
            self::Inactive => 'غير نشط',
            self::Blacklisted => 'محظور',
        };
    }
}
