<?php

namespace App\Modules\Finance\Enums;

enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Paid = 'paid';
    case Void = 'void';
    case Refunded = 'refunded';
}
