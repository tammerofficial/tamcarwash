<?php

namespace App\Modules\Finance\Enums;

enum CashDrawerStatus: string
{
    case Open = 'open';
    case Closed = 'closed';
    case Reconciled = 'reconciled';
}
