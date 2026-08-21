<?php

namespace App\Modules\Orders\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Orders\Enums\OrderItemType;
use App\Modules\Orders\Enums\OrderSource;
use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Orders\Events\OrderCreated;
use App\Modules\Orders\Events\OrderStatusChanged;
use App\Modules\Orders\Events\OrderWorkerAssigned;
use App\Modules\Orders\Jobs\SendOrderStatusNotificationJob;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Queue\Services\QueueService;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\OrderItem;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Services\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class OrderService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createWalkIn(array $data): Order
    {
        return $this->create(array_merge($data, [
            'source' => OrderSource::WalkIn,
        ]));
    }

    /**
     * @param  array<string, mixed>  $orderData
     */
    public function createFromBooking(Booking $booking, array $orderData = []): Order
    {
        if (empty($orderData['items'])) {
            $orderData['items'] = $this->buildItemsFromBooking($booking);
        }

        return $this->create(array_merge([
            'branch_id' => $booking->branch_id,
            'customer_id' => $booking->customer_id,
            'vehicle_id' => $booking->vehicle_id,
            'booking_id' => $booking->id,
            'source' => OrderSource::Booking,
            'notes' => $booking->notes,
        ], $orderData));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function buildItemsFromBooking(Booking $booking): array
    {
        $serviceIds = $booking->service_ids ?? [];

        if ($serviceIds === []) {
            return [];
        }

        $taxSettings = TaxSetting::query()->first();
        $vatRate = (float) ($taxSettings?->vat_rate ?? config('tammer.vat.default_rate', 5));
        $vatEnabled = (bool) ($taxSettings?->vat_enabled ?? true);
        $items = [];

        foreach (Service::query()->whereIn('id', $serviceIds)->get() as $service) {
            $unitPrice = (float) $service->base_price;
            $taxAmount = $vatEnabled ? round($unitPrice * ($vatRate / 100), 3) : 0.0;

            $items[] = [
                'item_type' => OrderItemType::Service,
                'name' => $service->name_ar ?: $service->name,
                'service_id' => $service->id,
                'quantity' => 1,
                'unit_price' => $unitPrice,
                'discount_amount' => 0,
                'tax_amount' => $taxAmount,
            ];
        }

        return $items;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'branch_id' => $data['branch_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'vehicle_id' => $data['vehicle_id'] ?? null,
                'booking_id' => $data['booking_id'] ?? null,
                'queue_entry_id' => $data['queue_entry_id'] ?? null,
                'worker_id' => $data['worker_id'] ?? null,
                'status' => OrderStatus::Pending,
                'source' => $data['source'] ?? OrderSource::WalkIn,
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? [],
            ]);

            if (! empty($data['items'])) {
                $this->syncItems($order, $data['items']);
                $this->recalculateTotals($order);
            }

            OrderCreated::dispatch($order->fresh(['items']));

            return $order->fresh(['items', 'customer', 'vehicle', 'worker']);
        });
    }

    public function checkIn(Order $order): Order
    {
        return $this->transition($order, OrderStatus::CheckedIn);
    }

    public function queue(Order $order, ?int $queueEntryId = null): Order
    {
        return DB::transaction(function () use ($order, $queueEntryId) {
            if ($queueEntryId) {
                $order->update(['queue_entry_id' => $queueEntryId]);
            }

            return $this->transition($order, OrderStatus::Queued);
        });
    }

    public function startService(Order $order, ?int $workerId = null): Order
    {
        return DB::transaction(function () use ($order, $workerId) {
            if ($workerId) {
                $this->assignWorker($order, $workerId, dispatchEvent: false);
            }

            $order = $this->transition($order, OrderStatus::InService);

            if ($order->queue_entry_id) {
                QueueEntry::query()
                    ->where('id', $order->queue_entry_id)
                    ->whereNotIn('status', [QueueEntryStatus::Completed, QueueEntryStatus::NoShow])
                    ->update([
                        'status' => QueueEntryStatus::InService,
                        'in_service_at' => now(),
                    ]);
            }

            return $order->fresh(['items', 'worker', 'queueEntry']);
        });
    }

    public function sendToQualityCheck(Order $order): Order
    {
        return $this->transition($order, OrderStatus::QualityCheck);
    }

    public function markReady(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = $this->transition($order, OrderStatus::Ready);

            if ($order->queue_entry_id) {
                QueueEntry::query()
                    ->where('id', $order->queue_entry_id)
                    ->update([
                        'status' => QueueEntryStatus::Ready,
                        'ready_at' => now(),
                    ]);
            }

            return $order->fresh(['queueEntry']);
        });
    }

    public function complete(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = $this->transition($order, OrderStatus::Completed);

            if ($order->queue_entry_id) {
                QueueEntry::query()
                    ->where('id', $order->queue_entry_id)
                    ->update([
                        'status' => QueueEntryStatus::Completed,
                        'completed_at' => now(),
                    ]);
            }

            return $order->fresh(['queueEntry']);
        });
    }

    public function cancel(Order $order, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $reason) {
            $order->update(['cancellation_reason' => $reason]);

            return $this->transition($order, OrderStatus::Cancelled);
        });
    }

    public function assignWorker(Order $order, int $workerId, bool $dispatchEvent = true): Order
    {
        $order->update(['worker_id' => $workerId]);

        if ($dispatchEvent) {
            OrderWorkerAssigned::dispatch($order->fresh(), $workerId);
        }

        return $order->fresh(['worker']);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function syncItems(Order $order, array $items): Order
    {
        foreach ($items as $item) {
            $this->addItem($order, $item);
        }

        return $this->recalculateTotals($order);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    public function addItem(Order $order, array $item): OrderItem
    {
        $quantity = (int) ($item['quantity'] ?? 1);
        $unitPrice = (float) ($item['unit_price'] ?? 0);
        $discount = (float) ($item['discount_amount'] ?? 0);
        $tax = (float) ($item['tax_amount'] ?? 0);
        $total = ($unitPrice * $quantity) - $discount + $tax;

        $orderItem = OrderItem::query()->create([
            'order_id' => $order->id,
            'service_id' => $item['service_id'] ?? null,
            'addon_id' => $item['addon_id'] ?? null,
            'item_type' => $item['item_type'] ?? OrderItemType::Service,
            'name' => $item['name'],
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'total_price' => $total,
            'worker_id' => $item['worker_id'] ?? null,
            'status' => $item['status'] ?? 'pending',
            'metadata' => $item['metadata'] ?? [],
        ]);

        $this->recalculateTotals($order);

        return $orderItem;
    }

    public function recalculateTotals(Order $order): Order
    {
        $items = $order->items()->get();

        $subtotal = $items->sum(fn (OrderItem $item) => ($item->unit_price * $item->quantity));
        $discount = $items->sum('discount_amount');
        $tax = $items->sum('tax_amount');
        $total = $items->sum('total_price');

        $order->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'total_amount' => $total > 0 ? $total : ($subtotal - $discount + $tax),
        ]);

        return $order->fresh(['items']);
    }

    protected function transition(Order $order, OrderStatus $status): Order
    {
        if (! $order->status->canTransitionTo($status)) {
            throw new InvalidArgumentException(
                "لا يمكن تغيير حالة الطلب من {$order->status->label()} إلى {$status->label()}."
            );
        }

        $previous = $order->status->value;
        $updates = ['status' => $status];

        if ($column = $status->timestampColumn()) {
            $updates[$column] = now();
        }

        $order->update($updates);

        OrderStatusChanged::dispatch($order->fresh(), $previous);
        SendOrderStatusNotificationJob::dispatch($order->fresh(), $previous);

        return $order->fresh(['items', 'customer', 'vehicle', 'worker', 'queueEntry', 'booking']);
    }

    protected function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
    }

    /**
     * @return array<string, mixed>|null
     */
    public function trackPublic(string $reference): ?array
    {
        $reference = trim($reference);

        if ($reference === '') {
            return null;
        }

        $order = Order::query()
            ->with(['vehicle', 'branch', 'queueEntry', 'items'])
            ->where('order_number', $reference)
            ->first();

        if (! $order) {
            $invoice = Invoice::query()->where('invoice_number', $reference)->first();

            if ($invoice?->order_id) {
                $order = Order::query()
                    ->with(['vehicle', 'branch', 'queueEntry', 'items'])
                    ->find($invoice->order_id);
            }
        }

        if (! $order) {
            return null;
        }

        /** @var QueueService $queueService */
        $queueService = app(QueueService::class);

        $queueEntry = $order->queueEntry;
        $queuePosition = $queueEntry ? $queueService->calculateQueuePosition($queueEntry) : null;
        $estimatedWait = $queueEntry?->estimated_wait_minutes
            ?? $queueService->calculateEstimatedWait((int) $order->branch_id);

        $invoiceNumber = Invoice::query()
            ->where('order_id', $order->id)
            ->value('invoice_number');

        return [
            'tracking_number' => $reference,
            'order_number' => $order->order_number,
            'invoice_number' => $invoiceNumber,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'branch_id' => $order->branch_id,
            'branch_name' => $order->branch?->name,
            'vehicle_plate_masked' => $this->maskPlateNumber($order->vehicle?->plate_number),
            'queue_number' => $queueEntry?->queue_number,
            'queue_position' => $queuePosition,
            'estimated_wait_minutes' => $estimatedWait,
            'timeline' => $this->buildPublicTrackingTimeline($order),
            'updated_at' => $order->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<int, array{title: string, time: string|null, state: string}>
     */
    protected function buildPublicTrackingTimeline(Order $order): array
    {
        $steps = [
            ['status' => OrderStatus::CheckedIn, 'title' => 'تم استلام السيارة'],
            ['status' => OrderStatus::Queued, 'title' => 'في الطابور'],
            ['status' => OrderStatus::InService, 'title' => 'بدء عملية الغسيل'],
            ['status' => OrderStatus::QualityCheck, 'title' => 'فحص الجودة'],
            ['status' => OrderStatus::Ready, 'title' => 'جاهزة للاستلام'],
            ['status' => OrderStatus::Completed, 'title' => 'تم التسليم'],
        ];

        $statusOrder = array_map(fn (array $step) => $step['status']->value, $steps);
        $currentIndex = array_search($order->status->value, $statusOrder, true);

        if ($order->status === OrderStatus::Cancelled) {
            return [];
        }

        return array_map(function (array $step) use ($order, $statusOrder, $currentIndex) {
            $stepIndex = array_search($step['status']->value, $statusOrder, true);
            $column = $step['status']->timestampColumn();
            $timestamp = $column ? $order->{$column} : null;

            if ($timestamp instanceof \DateTimeInterface) {
                $state = 'completed';
                $time = Carbon::parse($timestamp)->timezone(config('app.timezone'))->format('g:i A');
            } elseif ($currentIndex !== false && $stepIndex === $currentIndex) {
                $state = 'current';
                $time = 'قيد التنفيذ';
            } elseif ($currentIndex !== false && $stepIndex !== false && $stepIndex < $currentIndex) {
                $state = 'completed';
                $time = null;
            } else {
                $state = 'pending';
                $time = null;
            }

            return [
                'title' => $step['title'],
                'time' => $time,
                'state' => $state,
            ];
        }, $steps);
    }

    protected function maskPlateNumber(?string $plate): ?string
    {
        if ($plate === null || $plate === '') {
            return null;
        }

        $chars = preg_split('//u', $plate, -1, PREG_SPLIT_NO_EMPTY);

        if ($chars === false || count($chars) < 3) {
            return $plate;
        }

        $lastIndex = count($chars) - 1;

        for ($index = 1; $index < $lastIndex; $index++) {
            if ($chars[$index] !== ' ') {
                $chars[$index] = '•';
            }
        }

        return implode('', $chars);
    }

    /**
     * @return array<string, mixed>
     */
    public function getScreenData(int $branchId, ?Carbon $date = null): array
    {
        $date = $date ?? today();

        $activeStatuses = [
            OrderStatus::Pending,
            OrderStatus::CheckedIn,
            OrderStatus::Queued,
            OrderStatus::InService,
            OrderStatus::QualityCheck,
            OrderStatus::Ready,
        ];

        $orders = Order::query()
            ->with(['vehicle', 'queueEntry', 'items'])
            ->where('branch_id', $branchId)
            ->whereDate('created_at', $date)
            ->whereIn('status', $activeStatuses)
            ->get()
            ->sortBy(fn (Order $order) => match ($order->status) {
                OrderStatus::Ready => 0,
                OrderStatus::QualityCheck => 1,
                OrderStatus::InService => 2,
                OrderStatus::Queued => 3,
                OrderStatus::CheckedIn => 4,
                default => 5,
            })
            ->values();

        return [
            'branch_id' => $branchId,
            'date' => $date->toDateString(),
            'in_progress_count' => $orders
                ->filter(fn (Order $order) => ! in_array($order->status, [OrderStatus::Ready, OrderStatus::Pending], true))
                ->count(),
            'ready_count' => $orders->where('status', OrderStatus::Ready)->count(),
            'orders' => $orders,
        ];
    }
}
