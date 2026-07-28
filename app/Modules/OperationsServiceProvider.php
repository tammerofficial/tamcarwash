<?php

namespace App\Modules;

use App\Modules\Booking\Contracts\NullSmsNotifier;
use App\Modules\Booking\Contracts\NullWhatsAppNotifier;
use App\Modules\Booking\Contracts\SmsNotifierInterface;
use App\Modules\Booking\Contracts\WhatsAppNotifierInterface;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Policies\BookingPolicy;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Policies\OrderPolicy;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Queue\Policies\QueuePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class OperationsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(config_path('tammer.php'), 'tammer');

        $this->app->bind(WhatsAppNotifierInterface::class, NullWhatsAppNotifier::class);
        $this->app->bind(SmsNotifierInterface::class, NullSmsNotifier::class);
    }

    public function boot(): void
    {
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(QueueEntry::class, QueuePolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
