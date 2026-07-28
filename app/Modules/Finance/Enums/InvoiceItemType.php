<?php

namespace App\Modules\Finance\Enums;

enum InvoiceItemType: string
{
    case Service = 'service';
    case Addon = 'addon';
    case Product = 'product';
    case Other = 'other';
}
