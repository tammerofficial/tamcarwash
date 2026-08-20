<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Modules\Booking\Http\Requests\CancelBookingRequest;
use App\Modules\Booking\Http\Requests\RescheduleBookingRequest;
use App\Modules\Booking\Http\Requests\StoreBookingRequest;
use App\Modules\Booking\Http\Resources\BookingResource;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Services\BookingService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class BookingController extends ApiController
{
    public function __construct(
        protected BookingService $bookingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Booking::class);

        $query = Booking::query()
            ->with(['customer', 'vehicle', 'branch', 'timeSlot'])
            ->latest('scheduled_date');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->integer('branch_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('scheduled_date', $request->string('date'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($builder) use ($search) {
                $builder->where('booking_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('phone', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('vehicle', function ($vehicleQuery) use ($search) {
                        $vehicleQuery->where('plate_number', 'like', "%{$search}%");
                    });
            });
        }

        $bookings = $query->paginate($request->integer('per_page', 20));

        return $this->paginatedList($bookings, BookingResource::class);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->create($request->validated());

            return $this->success(
                BookingResource::make($booking),
                'تم إنشاء الحجز بنجاح.',
                201
            );
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load(['customer', 'vehicle', 'branch', 'timeSlot', 'order']);

        return $this->success(BookingResource::make($booking));
    }

    public function confirm(Booking $booking): JsonResponse
    {
        $this->authorize('confirm', $booking);

        try {
            $booking = $this->bookingService->confirm($booking);

            return $this->success(BookingResource::make($booking), 'تم تأكيد الحجز.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function cancel(CancelBookingRequest $request, Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->cancel($booking, $request->validated('reason'));

            return $this->success(BookingResource::make($booking), 'تم إلغاء الحجز.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function reschedule(RescheduleBookingRequest $request, Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->reschedule($booking, $request->validated());

            return $this->success(BookingResource::make($booking), 'تم إعادة جدولة الحجز.');
        } catch (InvalidArgumentException|RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function complete(Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        try {
            $booking = $this->bookingService->complete($booking);

            return $this->success(BookingResource::make($booking), 'تم إكمال الحجز.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function convertToOrder(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('convertToOrder', $booking);

        try {
            $booking = $this->bookingService->convertToOrder($booking, $request->all());

            return $this->success(BookingResource::make($booking->load('order')), 'تم تحويل الحجز إلى طلب.');
        } catch (InvalidArgumentException|RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
