<?php

namespace App\Modules\Pricing\Enums;

enum PriceRuleType: string
{
    case VehicleType = 'vehicle_type';
    case Branch = 'branch';
    case Service = 'service';
    case Subscription = 'subscription';
    case Corporate = 'corporate';

    public function label(): string
    {
        return match ($this) {
            self::VehicleType => 'نوع المركبة',
            self::Branch => 'الفرع',
            self::Service => 'الخدمة',
            self::Subscription => 'اشتراك',
            self::Corporate => 'شركات',
        };
    }
}
