<?php

namespace App\Modules\Shared\Http\Controllers;

use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Http\Resources\BookingResource;
use App\Modules\Booking\Http\Resources\TimeSlotResource;
use App\Modules\Booking\Services\BookingService;
use App\Modules\Booking\Services\TimeSlotService;
use App\Modules\Branches\Http\Resources\BranchResource;
use App\Modules\Branches\Models\Branch;
use App\Modules\Customers\Models\Customer;
use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Services\Http\Resources\ServiceResource;
use App\Modules\Services\Models\Service;
use App\Modules\Shared\Http\Requests\StorePublicBookingRequest;
use App\Modules\Vehicles\Models\Vehicle;
use App\Support\DefaultContact;
use App\Services\Tenancy\TenantContext;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class StorefrontController extends ApiController
{
    public function __construct(
        protected TenantContext $tenantContext,
        protected BookingService $bookingService,
        protected TimeSlotService $timeSlotService,
    ) {}

    public function show(): JsonResponse
    {
        $tenant = $this->tenantContext->get();

        if (! $tenant) {
            return $this->error('Tenant context not found.', 404, 'tenant_not_found');
        }

        $settings = $tenant->settings ?? [];
        $metadata = $tenant->metadata ?? [];

        $taxSettings = TaxSetting::query()->first();

        return $this->success([
            'business_name' => $tenant->name,
            'tenant_slug' => $tenant->slug,
            'email' => $tenant->email,
            'phone' => $tenant->phone ?: DefaultContact::phone(),
            'address' => DefaultContact::address(),
            'country' => $tenant->country ?? 'KW',
            'timezone' => $tenant->timezone ?? config('app.timezone', 'Asia/Muscat'),
            'currency' => config('tammer.vat.currency', 'OMR'),
            'vat_rate' => (float) ($taxSettings?->vat_rate ?? config('tammer.vat.default_rate', 5)),
            'branding' => [
                'logo_url' => $settings['logo_url'] ?? $metadata['logo_url'] ?? null,
                'primary_color' => $settings['primary_color'] ?? $metadata['primary_color'] ?? '#0ea5e9',
                'tagline' => $settings['tagline'] ?? $metadata['tagline'] ?? null,
                'about' => $settings['about'] ?? $metadata['about'] ?? null,
                'social' => $settings['social'] ?? $metadata['social'] ?? [],
            ],
            'stats' => [
                'branches' => Branch::query()->where('is_active', true)->count(),
                'services' => Service::query()->where('is_active', true)->count(),
            ],
        ]);
    }

    public function services(Request $request): JsonResponse
    {
        $services = Service::query()
            ->with(['category'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->limit($request->integer('limit', 12))
            ->get();

        return $this->success(ServiceResource::collection($services));
    }

    public function branches(): JsonResponse
    {
        $branches = Branch::query()
            ->with(['workingHours'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $branchesWithDefaults = $branches->map(function (Branch $branch) {
            $data = BranchResource::make($branch)->resolve();

            $data['phone'] = filled($data['phone'] ?? null) ? $data['phone'] : DefaultContact::phone();

            if (blank($data['address'] ?? null) && blank($data['city'] ?? null)) {
                $data['address'] = DefaultContact::address();
            }

            return $data;
        });

        return $this->success($branchesWithDefaults);
    }

    public function availableTimeSlots(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
        ], [
            'branch_id.required' => 'الفرع مطلوب.',
            'date.required' => 'التاريخ مطلوب.',
            'date.after_or_equal' => 'لا يمكن الحجز في تاريخ سابق.',
        ]);

        $slots = $this->timeSlotService->getAvailableSlots(
            $request->integer('branch_id'),
            Carbon::parse($request->string('date'))
        );

        return $this->success(TimeSlotResource::collection($slots));
    }

    public function storeBooking(StorePublicBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $customer = Customer::query()->firstOrCreate(
                ['phone' => $validated['customer']['phone']],
                [
                    'name' => $validated['customer']['name'],
                    'email' => $validated['customer']['email'] ?? null,
                ],
            );

            if (! $customer->wasRecentlyCreated && filled($validated['customer']['name'])) {
                $customer->update([
                    'name' => $validated['customer']['name'],
                    'email' => $validated['customer']['email'] ?? $customer->email,
                ]);
            }

            if ($customer->isBlacklisted()) {
                return $this->error('لا يمكن إتمام الحجز. يرجى التواصل مع المغسلة.', 422, 'customer_blacklisted');
            }

            $vehicleData = $validated['vehicle'];

            $vehicle = Vehicle::query()->firstOrCreate(
                [
                    'customer_id' => $customer->id,
                    'plate_number' => $vehicleData['plate_number'],
                ],
                [
                    'brand' => $vehicleData['brand'] ?? 'غير محدد',
                    'model' => $vehicleData['model'] ?? 'غير محدد',
                    'color' => $vehicleData['color'] ?? null,
                    'vehicle_type' => $vehicleData['vehicle_type'] ?? 'sedan',
                    'is_active' => true,
                ],
            );

            $booking = $this->bookingService->create([
                'branch_id' => $validated['branch_id'],
                'customer_id' => $customer->id,
                'vehicle_id' => $vehicle->id,
                'time_slot_id' => $validated['time_slot_id'] ?? null,
                'scheduled_date' => $validated['scheduled_date'],
                'scheduled_start_time' => $validated['scheduled_start_time'],
                'scheduled_end_time' => $validated['scheduled_end_time'] ?? null,
                'source' => BookingSource::Online,
                'notes' => $validated['notes'] ?? null,
                'service_ids' => $validated['service_ids'] ?? [],
            ]);

            return $this->success(
                BookingResource::make($booking),
                'تم إنشاء حجزك بنجاح. سنتواصل معك للتأكيد.',
                201,
            );
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
