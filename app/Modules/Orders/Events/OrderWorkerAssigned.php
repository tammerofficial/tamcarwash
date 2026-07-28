<?php

namespace App\Modules\Orders\Events;

use App\Modules\Orders\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderWorkerAssigned
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public int $workerId,
    ) {}
}
