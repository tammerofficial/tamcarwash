<?php

namespace Database\Seeders;

use App\Models\TenantUser;
use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Branches\Enums\BranchStatus;
use App\Modules\Branches\Models\Branch;
use App\Modules\Customers\Enums\CustomerStatus;
use App\Modules\Customers\Models\Customer;
use App\Modules\Finance\Enums\InvoiceItemType;
use App\Modules\Finance\Enums\InvoicePaymentStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Finance\Enums\PaymentStatus;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use App\Modules\Finance\Models\PaymentMethod;
use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Orders\Enums\OrderItemType;
use App\Modules\Orders\Enums\OrderSource;
use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\OrderItem;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Enums\QueueSource;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Vehicles\Enums\VehicleType;
use App\Modules\Vehicles\Models\Vehicle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DemoSimulationSeeder extends IdempotentSeeder
{
    private const DEMO_PREFIX = 'DEMO-';

    /** @var array<int, array{name: string, phone: string, email: string}> */
    private const CUSTOMERS = [
        ['name' => 'سالم بن راشد الهنائي', 'phone' => '+96890000101', 'email' => 'salem.demo@wadi.test'],
        ['name' => 'فاطمة بنت محمد المعمرية', 'phone' => '+96890000102', 'email' => 'fatima.demo@wadi.test'],
        ['name' => 'خالد بن عبدالله الشحي', 'phone' => '+96890000103', 'email' => 'khalid.demo@wadi.test'],
        ['name' => 'مريم بنت سعود البلوشية', 'phone' => '+96890000104', 'email' => 'mariam.demo@wadi.test'],
        ['name' => 'يوسف بن علي الزدجالي', 'phone' => '+96890000105', 'email' => 'youssef.demo@wadi.test'],
    ];

    /** @var array<int, array{plate: string, brand: string, model: string, color: string, type: VehicleType, customer_index: int}> */
    private const VEHICLES = [
        ['plate' => 'B 12345', 'brand' => 'Toyota', 'model' => 'Camry', 'color' => 'أبيض', 'type' => VehicleType::Sedan, 'customer_index' => 0],
        ['plate' => 'B 23456', 'brand' => 'Nissan', 'model' => 'Patrol', 'color' => 'أسود', 'type' => VehicleType::Suv, 'customer_index' => 0],
        ['plate' => 'M 34567', 'brand' => 'Hyundai', 'model' => 'Elantra', 'color' => 'فضي', 'type' => VehicleType::Sedan, 'customer_index' => 1],
        ['plate' => 'A 45678', 'brand' => 'Kia', 'model' => 'Sportage', 'color' => 'أحمر', 'type' => VehicleType::Suv, 'customer_index' => 2],
        ['plate' => 'D 56789', 'brand' => 'Mitsubishi', 'model' => 'L200', 'color' => 'رمادي', 'type' => VehicleType::Truck, 'customer_index' => 2],
        ['plate' => 'B 67890', 'brand' => 'Honda', 'model' => 'Accord', 'color' => 'أزرق', 'type' => VehicleType::Sedan, 'customer_index' => 3],
        ['plate' => 'M 78901', 'brand' => 'Mercedes', 'model' => 'C200', 'color' => 'أسود', 'type' => VehicleType::Sedan, 'customer_index' => 4],
        ['plate' => 'B 89012', 'brand' => 'Land Rover', 'model' => 'Discovery', 'color' => 'أبيض', 'type' => VehicleType::Suv, 'customer_index' => 4],
    ];

    public function run(): void
    {
        if (! Schema::hasTable('customers') || ! Schema::hasTable('branches')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'tenant tables missing']);

            return;
        }

        $created = 0;
        $updated = 0;

        $branch = $this->seedBranch($created, $updated);
        $this->seedTaxSettings($created, $updated);

        $customers = $this->seedCustomers($created, $updated);
        $vehicles = $this->seedVehicles($customers, $created, $updated);
        $services = $this->loadServices();
        $worker = TenantUser::query()->where('email', 'worker@demo.test')->first();
        $cashier = TenantUser::query()->where('email', 'cashier@demo.test')->first();

        $today = now()->toDateString();
        $vatRate = (float) config('tammer.vat.default_rate', 5);

        $bookings = $this->seedBookings($branch, $customers, $vehicles, $services, $today, $created, $updated);

        $queueWaiting = $this->seedQueueEntries($branch, $customers, $vehicles, $today, $created, $updated);
        $inServiceOrder = $this->seedInServiceOrder($branch, $customers, $vehicles, $services, $worker, $today, $created, $updated);
        $this->seedInvoices(
            $branch,
            $customers,
            $services,
            $cashier,
            $bookings['completed'],
            $inServiceOrder,
            $vatRate,
            $created,
            $updated,
        );

        $this->logResult(static::class, compact('created', 'updated') + [
            'skipped' => 0,
            'scenario' => 'مغسلة الوادي',
            'customers' => count($customers),
            'vehicles' => count($vehicles),
            'bookings_today' => 3,
            'queue_waiting' => count($queueWaiting),
            'orders_in_service' => 1,
            'invoices' => 2,
        ]);
    }

    protected function seedBranch(int &$created, int &$updated): Branch
    {
        $branch = Branch::query()->updateOrCreate(
            ['code' => 'main'],
            [
                'name' => 'فرع الخوير',
                'address' => 'الخوير، مسقط، سلطنة عمان',
                'city' => 'مسقط',
                'phone' => '+96824567890',
                'email' => 'info@wadi-wash.test',
                'status' => BranchStatus::Active,
                'is_active' => true,
                'capacity_per_hour' => 12,
            ]
        );

        $branch->wasRecentlyCreated ? $created++ : $updated++;

        return $branch;
    }

    protected function seedTaxSettings(int &$created, int &$updated): void
    {
        if (! Schema::hasTable('tax_settings')) {
            return;
        }

        $tax = TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
            'legal_name_ar' => 'مغسلة الوادي للسيارات',
            'legal_name_en' => 'Al Wadi Car Wash',
            'address' => 'الخوير، مسقط، سلطنة عمان',
            'vatin' => 'OM-VAT-DEMO-001',
            'cr_number' => 'CR-DEMO-1234567',
        ]);

        $tax->update([
            'legal_name_ar' => 'مغسلة الوادي للسيارات',
            'legal_name_en' => 'Al Wadi Car Wash',
            'address' => 'الخوير، مسقط، سلطنة عمان',
        ]);

        $tax->wasRecentlyCreated ? $created++ : $updated++;
    }

    /**
     * @return array<int, Customer>
     */
    protected function seedCustomers(int &$created, int &$updated): array
    {
        $customers = [];

        foreach (self::CUSTOMERS as $spec) {
            $customer = Customer::query()->updateOrCreate(
                ['phone' => $spec['phone']],
                [
                    'name' => $spec['name'],
                    'email' => $spec['email'],
                    'status' => CustomerStatus::Active,
                    'loyalty_points_balance' => 0,
                ]
            );

            $customer->wasRecentlyCreated ? $created++ : $updated++;
            $customers[] = $customer;
        }

        return $customers;
    }

    /**
     * @param  array<int, Customer>  $customers
     * @return array<int, Vehicle>
     */
    protected function seedVehicles(array $customers, int &$created, int &$updated): array
    {
        $vehicles = [];

        foreach (self::VEHICLES as $spec) {
            $vehicle = Vehicle::query()->updateOrCreate(
                ['plate_number' => $spec['plate']],
                [
                    'customer_id' => $customers[$spec['customer_index']]->id,
                    'brand' => $spec['brand'],
                    'model' => $spec['model'],
                    'color' => $spec['color'],
                    'vehicle_type' => $spec['type'],
                    'year' => 2022,
                    'is_active' => true,
                ]
            );

            $vehicle->wasRecentlyCreated ? $created++ : $updated++;
            $vehicles[] = $vehicle;
        }

        return $vehicles;
    }

    /**
     * @return array<string, mixed>
     */
    protected function loadServices(): array
    {
        if (! Schema::hasTable('services')) {
            return ['basic' => null, 'premium' => null];
        }

        return [
            'basic' => DB::table('services')->where('slug', 'basic-wash')->first(),
            'premium' => DB::table('services')->where('slug', 'premium-wash')->first(),
        ];
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @param  array<string, mixed>  $services
     * @return array{confirmed: Booking, pending: Booking, completed: Booking}
     */
    protected function seedBookings(
        Branch $branch,
        array $customers,
        array $vehicles,
        array $services,
        string $today,
        int &$created,
        int &$updated,
    ): array {
        $serviceIds = array_values(array_filter([
            $services['basic']?->id,
            $services['premium']?->id,
        ]));

        $confirmed = Booking::query()->updateOrCreate(
            ['booking_number' => self::DEMO_PREFIX.'BK-CONFIRMED'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[0]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '10:00:00',
                'scheduled_end_time' => '10:30:00',
                'status' => BookingStatus::Confirmed,
                'source' => BookingSource::Phone,
                'notes' => 'حجز مؤكد — غسيل أساسي قبل الظهر',
                'confirmed_at' => now()->subHours(2),
                'service_ids' => $serviceIds ? [$serviceIds[0]] : [],
            ]
        );
        $confirmed->wasRecentlyCreated ? $created++ : $updated++;

        $pending = Booking::query()->updateOrCreate(
            ['booking_number' => self::DEMO_PREFIX.'BK-PENDING'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[1]->id,
                'vehicle_id' => $vehicles[2]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '14:00:00',
                'scheduled_end_time' => '14:45:00',
                'status' => BookingStatus::Pending,
                'source' => BookingSource::Online,
                'notes' => 'حجز معلق — ينتظر تأكيد الكاشير',
                'service_ids' => $serviceIds,
            ]
        );
        $pending->wasRecentlyCreated ? $created++ : $updated++;

        $completedOrder = Order::query()->updateOrCreate(
            ['order_number' => self::DEMO_PREFIX.'ORD-COMPLETED'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[2]->id,
                'vehicle_id' => $vehicles[3]->id,
                'status' => OrderStatus::Completed,
                'source' => OrderSource::Booking,
                'subtotal' => 4.500,
                'discount_amount' => 0,
                'tax_amount' => 0.225,
                'total_amount' => 4.725,
                'completed_at' => now()->subHours(1),
                'notes' => 'طلب مكتمل من حجز الصباح',
            ]
        );
        $completedOrder->wasRecentlyCreated ? $created++ : $updated++;

        if ($services['premium']) {
            OrderItem::query()->updateOrCreate(
                [
                    'order_id' => $completedOrder->id,
                    'name' => 'غسيل مميز — DEMO',
                ],
                [
                    'service_id' => $services['premium']->id,
                    'item_type' => OrderItemType::Service,
                    'quantity' => 1,
                    'unit_price' => 4.500,
                    'discount_amount' => 0,
                    'tax_amount' => 0.225,
                    'total_price' => 4.725,
                    'status' => 'completed',
                ]
            );
        }

        $completed = Booking::query()->updateOrCreate(
            ['booking_number' => self::DEMO_PREFIX.'BK-COMPLETED'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[2]->id,
                'vehicle_id' => $vehicles[3]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '08:00:00',
                'scheduled_end_time' => '08:45:00',
                'status' => BookingStatus::Completed,
                'source' => BookingSource::Admin,
                'order_id' => $completedOrder->id,
                'completed_at' => now()->subHours(1),
                'notes' => 'حجز مكتمل — تم التسليم',
                'service_ids' => $serviceIds ? [$serviceIds[1] ?? $serviceIds[0]] : [],
            ]
        );
        $completed->wasRecentlyCreated ? $created++ : $updated++;

        $completedOrder->update(['booking_id' => $completed->id]);

        return compact('confirmed', 'pending', 'completed');
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @return array<int, QueueEntry>
     */
    protected function seedQueueEntries(
        Branch $branch,
        array $customers,
        array $vehicles,
        string $today,
        int &$created,
        int &$updated,
    ): array {
        $entries = [];

        $specs = [
            ['number' => 901, 'customer_index' => 0, 'vehicle_index' => 0, 'source' => QueueSource::Booked, 'notes' => 'حجز — غسيل كامل'],
            ['number' => 902, 'customer_index' => 1, 'vehicle_index' => 2, 'source' => QueueSource::WalkIn, 'notes' => 'حضور مباشر — غسيل أساسي'],
            ['number' => 903, 'customer_index' => 2, 'vehicle_index' => 3, 'source' => QueueSource::WalkIn, 'notes' => 'اشتراك شهري — SUV'],
            ['number' => 904, 'customer_index' => 3, 'vehicle_index' => 5, 'source' => QueueSource::Booked, 'notes' => 'حجز أونلاين — غسيل مميز'],
            ['number' => 905, 'customer_index' => 4, 'vehicle_index' => 6, 'source' => QueueSource::WalkIn, 'notes' => 'شركة — أسطول مركبات'],
            ['number' => 906, 'customer_index' => 0, 'vehicle_index' => 1, 'source' => QueueSource::WalkIn, 'notes' => 'حضور مباشر — غسيل داخلي'],
            ['number' => 907, 'customer_index' => 1, 'vehicle_index' => 2, 'source' => QueueSource::Booked, 'notes' => 'حجز — غسيل كامل'],
            ['number' => 908, 'customer_index' => 2, 'vehicle_index' => 4, 'source' => QueueSource::WalkIn, 'notes' => 'اشتراك — بيك أب'],
            ['number' => 909, 'customer_index' => 3, 'vehicle_index' => 5, 'source' => QueueSource::WalkIn, 'notes' => 'شركة — عقد سنوي'],
            ['number' => 910, 'customer_index' => 4, 'vehicle_index' => 7, 'source' => QueueSource::Booked, 'notes' => 'حجز — Land Cruiser'],
        ];

        foreach ($specs as $spec) {
            $entry = QueueEntry::query()
                ->where('branch_id', $branch->id)
                ->whereDate('queue_date', $today)
                ->where('queue_number', $spec['number'])
                ->first();

            $payload = [
                'source' => $spec['source'],
                'customer_id' => $customers[$spec['customer_index']]->id,
                'vehicle_id' => $vehicles[$spec['vehicle_index']]->id,
                'status' => QueueEntryStatus::Waiting,
                'estimated_wait_minutes' => 15 + ($spec['number'] - 901) * 5,
                'priority' => $spec['source'] === QueueSource::Booked ? 10 : 0,
                'notes' => $spec['notes'],
            ];

            if ($entry) {
                $entry->update($payload);
                $updated++;
            } else {
                QueueEntry::query()->create($payload + [
                    'branch_id' => $branch->id,
                    'queue_date' => $today,
                    'queue_number' => $spec['number'],
                ]);
                $created++;
            }

            $entries[] = $entry ?? QueueEntry::query()
                ->where('branch_id', $branch->id)
                ->whereDate('queue_date', $today)
                ->where('queue_number', $spec['number'])
                ->first();
        }

        return $entries;
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @param  array<string, mixed>  $services
     */
    protected function seedInServiceOrder(
        Branch $branch,
        array $customers,
        array $vehicles,
        array $services,
        ?TenantUser $worker,
        string $today,
        int &$created,
        int &$updated,
    ): Order {
        $queueEntry = QueueEntry::query()
            ->where('branch_id', $branch->id)
            ->whereDate('queue_date', $today)
            ->where('queue_number', 911)
            ->first();

        $queuePayload = [
            'source' => QueueSource::WalkIn,
            'customer_id' => $customers[0]->id,
            'vehicle_id' => $vehicles[1]->id,
            'status' => QueueEntryStatus::InService,
            'estimated_wait_minutes' => 0,
            'priority' => 5,
            'in_service_at' => now()->subMinutes(15),
            'notes' => 'قيد الغسيل الآن — Bay 2',
        ];

        if ($queueEntry) {
            $queueEntry->update($queuePayload);
            $updated++;
        } else {
            $queueEntry = QueueEntry::query()->create($queuePayload + [
                'branch_id' => $branch->id,
                'queue_date' => $today,
                'queue_number' => 911,
            ]);
            $created++;
        }

        $order = Order::query()->updateOrCreate(
            ['order_number' => self::DEMO_PREFIX.'ORD-INSERVICE'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[1]->id,
                'queue_entry_id' => $queueEntry->id,
                'worker_id' => $worker?->id,
                'status' => OrderStatus::InService,
                'source' => OrderSource::WalkIn,
                'subtotal' => 2.500,
                'discount_amount' => 0,
                'tax_amount' => 0.125,
                'total_amount' => 2.625,
                'in_service_at' => now()->subMinutes(15),
                'notes' => 'طلب حضوري — قيد التنفيذ',
            ]
        );
        $order->wasRecentlyCreated ? $created++ : $updated++;

        $queueEntry->update(['order_id' => $order->id]);

        if ($services['basic']) {
            OrderItem::query()->updateOrCreate(
                [
                    'order_id' => $order->id,
                    'name' => 'غسيل أساسي — DEMO',
                ],
                [
                    'service_id' => $services['basic']->id,
                    'item_type' => OrderItemType::Service,
                    'quantity' => 1,
                    'unit_price' => 2.500,
                    'discount_amount' => 0,
                    'tax_amount' => 0.125,
                    'total_price' => 2.625,
                    'worker_id' => $worker?->id,
                    'status' => 'in_progress',
                ]
            );
        }

        return $order;
    }

    protected function seedInvoices(
        Branch $branch,
        array $customers,
        array $services,
        ?TenantUser $cashier,
        Booking $completedBooking,
        Order $inServiceOrder,
        float $vatRate,
        int &$created,
        int &$updated,
    ): void {
        $completedOrder = Order::query()
            ->where('booking_id', $completedBooking->id)
            ->first();

        if (! $completedOrder) {
            return;
        }

        $paidSubtotal = 4.500;
        $paidVat = round($paidSubtotal * ($vatRate / 100), 3);
        $paidTotal = round($paidSubtotal + $paidVat, 3);

        $paidInvoice = Invoice::query()->updateOrCreate(
            ['invoice_number' => self::DEMO_PREFIX.'INV-PAID'],
            [
                'order_id' => $completedOrder->id,
                'customer_id' => $completedBooking->customer_id,
                'branch_id' => $branch->id,
                'status' => InvoiceStatus::Paid,
                'payment_status' => InvoicePaymentStatus::Paid,
                'issue_date' => now()->toDateString(),
                'subtotal' => $paidSubtotal,
                'discount_amount' => 0,
                'vat_rate' => $vatRate,
                'vat_amount' => $paidVat,
                'total' => $paidTotal,
                'customer_name' => $customers[2]->name,
                'customer_phone' => $customers[2]->phone,
                'customer_email' => $customers[2]->email,
                'issued_by' => $cashier?->id,
            ]
        );
        $paidInvoice->wasRecentlyCreated ? $created++ : $updated++;

        $paidInvoice->items()->delete();
        $paidInvoice->items()->create([
            'item_type' => InvoiceItemType::Service,
            'item_id' => $services['premium']?->id,
            'description' => 'غسيل مميز',
            'quantity' => 1,
            'unit_price' => $paidSubtotal,
            'discount_amount' => 0,
            'subtotal' => $paidSubtotal,
            'vat_rate' => $vatRate,
            'vat_amount' => $paidVat,
            'total' => $paidTotal,
            'is_tax_exempt' => false,
            'sort_order' => 0,
        ]);

        if (Schema::hasTable('payments')) {
            $cashMethod = PaymentMethod::query()->where('code', 'cash')->first();

            if ($cashMethod) {
                Payment::query()->updateOrCreate(
                    [
                        'invoice_id' => $paidInvoice->id,
                        'reference_number' => self::DEMO_PREFIX.'PAY-001',
                    ],
                    [
                        'order_id' => $completedOrder->id,
                        'payment_method_id' => $cashMethod->id,
                        'branch_id' => $branch->id,
                        'amount' => $paidTotal,
                        'paid_at' => now()->subMinutes(45),
                        'status' => PaymentStatus::Completed,
                        'received_by' => $cashier?->id,
                        'notes' => 'دفع نقدي — فاتورة مكتملة',
                    ]
                );
            }
        }

        $unpaidSubtotal = 2.500;
        $unpaidVat = round($unpaidSubtotal * ($vatRate / 100), 3);
        $unpaidTotal = round($unpaidSubtotal + $unpaidVat, 3);

        $unpaidInvoice = Invoice::query()->updateOrCreate(
            ['invoice_number' => self::DEMO_PREFIX.'INV-UNPAID'],
            [
                'order_id' => $inServiceOrder->id,
                'customer_id' => $inServiceOrder->customer_id,
                'branch_id' => $branch->id,
                'status' => InvoiceStatus::Issued,
                'payment_status' => InvoicePaymentStatus::Unpaid,
                'issue_date' => now()->toDateString(),
                'subtotal' => $unpaidSubtotal,
                'discount_amount' => 0,
                'vat_rate' => $vatRate,
                'vat_amount' => $unpaidVat,
                'total' => $unpaidTotal,
                'customer_name' => $customers[0]->name,
                'customer_phone' => $customers[0]->phone,
                'customer_email' => $customers[0]->email,
                'issued_by' => $cashier?->id,
                'notes' => 'فاتورة معلقة — الطلب لا يزال قيد الخدمة',
            ]
        );
        $unpaidInvoice->wasRecentlyCreated ? $created++ : $updated++;

        $unpaidInvoice->items()->delete();
        $unpaidInvoice->items()->create([
            'item_type' => InvoiceItemType::Service,
            'item_id' => $services['basic']?->id,
            'description' => 'غسيل أساسي',
            'quantity' => 1,
            'unit_price' => $unpaidSubtotal,
            'discount_amount' => 0,
            'subtotal' => $unpaidSubtotal,
            'vat_rate' => $vatRate,
            'vat_amount' => $unpaidVat,
            'total' => $unpaidTotal,
            'is_tax_exempt' => false,
            'sort_order' => 0,
        ]);
    }
}
