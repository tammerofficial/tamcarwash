<?php

namespace App\Modules\Orders\Enums;

enum OrderItemType: string
{
    case Service = 'service';
    case Addon = 'addon';

    public function label(): string
    {
        return match ($this) {
            self::Service => 'خدمة',
            self::Addon => 'إضافة',
        };
    }
}
