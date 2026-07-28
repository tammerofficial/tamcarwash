<?php

namespace App\Modules\Branches\Enums;

enum WashBayStatus: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';
    case Offline = 'offline';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'متاح',
            self::Occupied => 'مشغول',
            self::Maintenance => 'صيانة',
            self::Offline => 'غير متصل',
        };
    }
}
