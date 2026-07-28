<?php

namespace App\Modules\Finance\Enums;

enum ExpenseStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Paid = 'paid';
    case Rejected = 'rejected';
}
