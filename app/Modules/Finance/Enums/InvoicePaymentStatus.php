<?php

namespace App\Modules\Finance\Enums;

enum InvoicePaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Partial = 'partial';
    case Paid = 'paid';
}
