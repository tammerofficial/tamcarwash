<?php

namespace App\Modules\Vehicles\Enums;

enum VehicleType: string
{
    case Sedan = 'sedan';
    case Suv = 'suv';
    case Truck = 'truck';
    case Motorcycle = 'motorcycle';
    case Van = 'van';
    case Bus = 'bus';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Sedan => 'سيدان',
            self::Suv => 'دفع رباعي',
            self::Truck => 'شاحنة',
            self::Motorcycle => 'دراجة نارية',
            self::Van => 'فان',
            self::Bus => 'حافلة',
            self::Other => 'أخرى',
        };
    }
}
