<?php

namespace App\Modules\Orders\Http\Controllers;

use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Orders\Http\Requests\AssignWorkerRequest;
use App\Modules\Orders\Http\Requests\StoreOrderItemRequest;
use App\Modules\Orders\Http\Requests\StoreOrderRequest;
use App\Modules\Orders\Http\Requests\TransitionOrderRequest;
use App\Modules\Orders\Http\Resources\OrderItemResource;
use App\Modules\Orders\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Services\OrderService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class OrderController extends ApiController
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $query = Order::query()
            ->with(['customer', 'vehicle', 'worker', 'items'])
            ->latest();

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->integer('branch_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('worker_id')) {
            $query->where('worker_id', $request->integer('worker_id'));
        }

        if ($request->filled('source')) {
            $query->where('source', $request->string('source'));
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->string('date'));
        }

        $orders = $query->paginate($request->integer('per_page', 20));

        return $this->paginatedList($orders, OrderResource::class);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->createWalkIn($request->validated());

        return $this->success(
            OrderResource::make($order),
            'تم إنشاء الطلب.',
            201
        );
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load(['customer', 'vehicle', 'worker', 'items.worker', 'booking', 'queueEntry']);

        return $this->success(OrderResource::make($order));
    }

    public function transition(TransitionOrderRequest $request, Order $order): JsonResponse
    {
        try {
            $status = $request->enum('status', OrderStatus::class);

            $order = match ($status) {
                OrderStatus::CheckedIn => $this->orderService->checkIn($order),
                OrderStatus::Queued => $this->orderService->queue($order, $request->integer('queue_entry_id') ?: null),
                OrderStatus::InService => $this->orderService->startService($order, $request->integer('worker_id') ?: null),
                OrderStatus::QualityCheck => $this->orderService->sendToQualityCheck($order),
                OrderStatus::Ready => $this->orderService->markReady($order),
                OrderStatus::Completed => $this->orderService->complete($order),
                OrderStatus::Cancelled => $this->orderService->cancel($order, $request->validated('reason')),
                default => throw new InvalidArgumentException('حالة غير مدعومة.'),
            };

            return $this->success(OrderResource::make($order), 'تم تحديث حالة الطلب.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function assignWorker(AssignWorkerRequest $request, Order $order): JsonResponse
    {
        $order = $this->orderService->assignWorker($order, $request->integer('worker_id'));

        return $this->success(OrderResource::make($order), 'تم تعيين العامل.');
    }

    public function addItem(StoreOrderItemRequest $request, Order $order): JsonResponse
    {
        $item = $this->orderService->addItem($order, $request->validated());

        return $this->success(
            OrderItemResource::make($item->load('worker')),
            'تم إضافة البند.',
            201
        );
    }
}
