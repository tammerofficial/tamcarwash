<?php

namespace App\Modules\Customers\Enums;

enum LoyaltyPointType: string
{
    case Earn = 'earn';
    case Redeem = 'redeem';
    case Adjust = 'adjust';
    case Expire = 'expire';

    public function label(): string
    {
        return match ($this) {
            self::Earn => 'اكتساب',
            self::Redeem => 'استبدال',
            self::Adjust => 'تعديل',
            self::Expire => 'انتهاء',
        };
    }
}
