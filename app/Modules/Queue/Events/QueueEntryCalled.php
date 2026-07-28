<?php

namespace App\Modules\Queue\Events;

use App\Modules\Queue\Models\QueueEntry;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QueueEntryCalled
{
    use Dispatchable, SerializesModels;

    public function __construct(public QueueEntry $entry) {}
}
