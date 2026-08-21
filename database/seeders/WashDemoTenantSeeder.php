<?php

namespace Database\Seeders;

use App\Models\TenantUser;
use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Branches\Enums\BranchStatus;
use App\Modules\Branches\Enums\WashBayStatus;
use App\Modules\Branches\Models\Branch;
use App\Modules\Branches\Models\WashBay;
use App\Modules\Branches\Models\WorkingHour;
use App\Modules\Customers\Enums\CustomerStatus;
use App\Modules\Customers\Models\Customer;
use App\Modules\Finance\Enums\ExpenseStatus;
use App\Modules\Finance\Enums\InvoiceItemType;
use App\Modules\Finance\Enums\InvoicePaymentStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Finance\Enums\PaymentStatus;
use App\Modules\Finance\Models\Expense;
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
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Services\Models\ServiceVehicleTypePrice;
use App\Modules\Vehicles\Enums\VehicleType;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

class WashDemoTenantSeeder extends IdempotentSeeder
{
    private const PREFIX = 'WASH-';

    /** @var array<int, array<string, mixed>> */
    private const BRANCHES = [
        ['code' => 'khawr', 'name' => 'فرع الخوير', 'city' => 'مسقط', 'capacity' => 15, 'phone' => '+96824567801'],
        ['code' => 'sohar', 'name' => 'فرع صحار', 'city' => 'صحار', 'capacity' => 12, 'phone' => '+96826876501'],
        ['code' => 'sahm', 'name' => 'فرع صحم', 'city' => 'صحم', 'capacity' => 10, 'phone' => '+96826834501'],
    ];

    /** @var array<int, array<string, mixed>> */
    private const SERVICES = [
        [
            'slug' => 'exterior-wash',
            'category' => 'exterior',
            'name_ar' => 'غسيل خارجي',
            'duration' => 20,
            'prices' => ['sedan' => 3.0, 'suv' => 4.0, 'pickup' => 4.5],
        ],
        [
            'slug' => 'full-wash',
            'category' => 'full',
            'name_ar' => 'غسيل كامل',
            'duration' => 40,
            'prices' => ['sedan' => 6.0, 'suv' => 7.5, 'pickup' => 8.0],
        ],
        [
            'slug' => 'interior-detail',
            'category' => 'interior',
            'name_ar' => 'تلميع داخلي',
            'duration' => 60,
            'prices' => ['sedan' => 4.0, 'suv' => 5.0, 'pickup' => 5.5],
        ],
        [
            'slug' => 'nano-ceramic',
            'category' => 'full',
            'name_ar' => 'نانو سيراميك',
            'duration' => 180,
            'prices' => ['sedan' => 35.0, 'suv' => 45.0, 'pickup' => 50.0],
        ],
    ];

    /** @var array<int, array<string, mixed>> */
    private const WORKERS = [
        ['email' => 'ahmad.balushi@alwadi.test', 'name' => 'أحمد البلوشي', 'skills' => 'غسيل خارجي، غسيل كامل'],
        ['email' => 'salem.hinai@alwadi.test', 'name' => 'سالم الهنائي', 'skills' => 'غسيل خارجي، تلميع داخلي'],
        ['email' => 'nasser.maamari@alwadi.test', 'name' => 'ناصر المعمري', 'skills' => 'غسيل كامل، نانو سيراميك'],
        ['email' => 'mohammed.kindy@alwadi.test', 'name' => 'محمد الكندي', 'skills' => 'غسيل خارجي، تلميع داخلي'],
        ['email' => 'youssef.shahi@alwadi.test', 'name' => 'يوسف الشحي', 'skills' => 'نانو سيراميك، غسيل كامل'],
    ];

    /** @var array<int, array<string, mixed>> */
    private const CASHIERS = [
        ['email' => 'cashier.khawr@alwadi.test', 'name' => 'كاشير الخوير', 'branch' => 'khawr'],
        ['email' => 'cashier.sohar@alwadi.test', 'name' => 'كاشير صحار', 'branch' => 'sohar'],
        ['email' => 'cashier.sahm@alwadi.test', 'name' => 'كاشير صحم', 'branch' => 'sahm'],
    ];

    /** @var array<int, array<string, mixed>> */
    private const EXPENSES = [
        ['ref' => 'EXP-CLEAN', 'category' => 'supplies', 'description' => 'مواد تنظيف', 'amount' => 18.0, 'vat' => true],
        ['ref' => 'EXP-ELEC', 'category' => 'utilities', 'description' => 'كهرباء', 'amount' => 42.0, 'vat' => false],
        ['ref' => 'EXP-TOWEL', 'category' => 'supplies', 'description' => 'مناشف', 'amount' => 12.5, 'vat' => true],
        ['ref' => 'EXP-MAINT', 'category' => 'maintenance', 'description' => 'صيانة', 'amount' => 35.0, 'vat' => true],
        ['ref' => 'EXP-MKT', 'category' => 'marketing', 'description' => 'تسويق', 'amount' => 20.0, 'vat' => true],
    ];

    public function run(): void
    {
        if (! Schema::hasTable('branches')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'tenant tables missing']);

            return;
        }

        $created = 0;
        $updated = 0;
        $vatRate = (float) config('tammer.vat.default_rate', 5);

        $this->callSilent(TenantProductionSeeder::class);

        $branches = $this->seedBranches($created, $updated);
        $services = $this->seedServices($created, $updated);
        $workers = $this->seedStaff($created, $updated);
        $cashiers = $workers['cashiers'];
        $this->seedTaxSettings($created, $updated);
        $company = $this->seedCorporateCompany($created, $updated);
        $primaryCustomer = $this->seedPrimaryCustomer($company, $created, $updated);
        $extraCustomers = $this->seedExtraCustomers($created, $updated);
        $vehicles = $this->seedVehicles($primaryCustomer, $extraCustomers, $created, $updated);
        $this->seedExpenses($branches, $vatRate, $created, $updated);
        $this->seedHistoricalOrders($branches, $services, $workers['workers'], $cashiers, $extraCustomers, $vehicles, $vatRate, $created, $updated);
        $this->seedLiveScenario($branches, $services, $workers['workers'], $cashiers, $primaryCustomer, $extraCustomers, $vehicles, $vatRate, $created, $updated);

        $this->logResult(static::class, compact('created', 'updated') + [
            'skipped' => 0,
            'branches' => count($branches),
            'services' => count($services),
            'workers' => count($workers['workers']),
            'customers' => 1 + count($extraCustomers),
        ]);
    }

    /**
     * @return array<string, Branch>
     */
    protected function seedBranches(int &$created, int &$updated): array
    {
        $branches = [];

        foreach (self::BRANCHES as $spec) {
            $branch = Branch::query()->updateOrCreate(
                ['code' => $spec['code']],
                [
                    'name' => $spec['name'],
                    'address' => $spec['name'].' — '.$spec['city'],
                    'city' => $spec['city'],
                    'phone' => $spec['phone'],
                    'email' => $spec['code'].'@alwadi.test',
                    'status' => BranchStatus::Active,
                    'is_active' => true,
                    'capacity_per_hour' => $spec['capacity'],
                ]
            );
            $branch->wasRecentlyCreated ? $created++ : $updated++;
            $branches[$spec['code']] = $branch;

            for ($day = 0; $day <= 6; $day++) {
                $isWeekend = in_array($day, [5, 6], true);
                WorkingHour::query()->updateOrCreate(
                    ['branch_id' => $branch->id, 'day_of_week' => $day],
                    [
                        'opens_at' => $isWeekend ? '09:00:00' : '08:00:00',
                        'closes_at' => $isWeekend ? '23:00:00' : '22:00:00',
                        'is_closed' => false,
                    ]
                );
            }

            foreach ([1, 2, 3] as $bayNumber) {
                WashBay::query()->updateOrCreate(
                    ['branch_id' => $branch->id, 'bay_number' => $bayNumber],
                    [
                        'name' => "Bay {$bayNumber}",
                        'status' => WashBayStatus::Available,
                        'is_active' => true,
                    ]
                );
            }
        }

        return $branches;
    }

    /**
     * @return array<string, Service>
     */
    protected function seedServices(int &$created, int &$updated): array
    {
        $services = [];
        $vatRate = config('tammer.vat.default_rate', 5);

        $categories = [
            'exterior' => ServiceCategory::query()->firstOrCreate(
                ['slug' => 'exterior'],
                ['name' => 'Exterior', 'name_ar' => 'غسيل خارجي', 'sort_order' => 1, 'is_active' => true]
            ),
            'interior' => ServiceCategory::query()->firstOrCreate(
                ['slug' => 'interior'],
                ['name' => 'Interior', 'name_ar' => 'غسيل داخلي', 'sort_order' => 2, 'is_active' => true]
            ),
            'full' => ServiceCategory::query()->firstOrCreate(
                ['slug' => 'full'],
                ['name' => 'Full', 'name_ar' => 'غسيل شامل', 'sort_order' => 3, 'is_active' => true]
            ),
        ];

        foreach (self::SERVICES as $spec) {
            $service = Service::query()->updateOrCreate(
                ['slug' => $spec['slug']],
                [
                    'category_id' => $categories[$spec['category']]->id,
                    'name' => $spec['name_ar'],
                    'name_ar' => $spec['name_ar'],
                    'duration_minutes' => $spec['duration'],
                    'base_price' => $spec['prices']['sedan'],
                    'vat_included' => false,
                    'vat_rate' => $vatRate,
                    'is_active' => true,
                ]
            );
            $service->wasRecentlyCreated ? $created++ : $updated++;
            $services[$spec['slug']] = $service;

            $typeMap = [
                'sedan' => VehicleType::Sedan,
                'suv' => VehicleType::Suv,
                'pickup' => VehicleType::Truck,
            ];

            foreach ($spec['prices'] as $typeKey => $price) {
                ServiceVehicleTypePrice::query()->updateOrCreate(
                    ['service_id' => $service->id, 'vehicle_type' => $typeMap[$typeKey]],
                    ['price' => $price]
                );
            }
        }

        $branchIds = Branch::query()->pluck('id');
        foreach ($services as $service) {
            $service->branches()->syncWithoutDetaching(
                $branchIds->mapWithKeys(fn ($id) => [$id => ['is_available' => true]])->all()
            );
        }

        return $services;
    }

    /**
     * @return array{workers: array<string, TenantUser>, cashiers: array<string, TenantUser>}
     */
    protected function seedStaff(int &$created, int &$updated): array
    {
        $workerRole = Role::query()->where('name', 'worker')->where('guard_name', 'tenant')->first();
        $cashierRole = Role::query()->where('name', 'cashier')->where('guard_name', 'tenant')->first();

        $workers = [];
        foreach (self::WORKERS as $spec) {
            $user = TenantUser::query()->updateOrCreate(
                ['email' => $spec['email']],
                [
                    'name' => $spec['name'].' · '.$spec['skills'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $user->wasRecentlyCreated ? $created++ : $updated++;
            if ($workerRole) {
                $user->syncRoles([$workerRole]);
            }
            $workers[$spec['email']] = $user;
        }

        $cashiers = [];
        foreach (self::CASHIERS as $spec) {
            $user = TenantUser::query()->updateOrCreate(
                ['email' => $spec['email']],
                [
                    'name' => $spec['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $user->wasRecentlyCreated ? $created++ : $updated++;
            if ($cashierRole) {
                $user->syncRoles([$cashierRole]);
            }
            $cashiers[$spec['branch']] = $user;
        }

        return ['workers' => $workers, 'cashiers' => $cashiers];
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
            'vatin' => 'OM-VAT-ALWADI-001',
            'cr_number' => 'CR-1234567',
        ]);

        $tax->update([
            'legal_name_ar' => 'مغسلة الوادي للسيارات',
            'legal_name_en' => 'Al Wadi Car Wash',
        ]);

        $tax->wasRecentlyCreated ? $created++ : $updated++;
    }

    protected function seedCorporateCompany(int &$created, int &$updated): Company
    {
        $company = Company::query()->updateOrCreate(
            ['name' => 'شركة الوادي للتجارة'],
            [
                'contact_name' => 'مدير المشتريات',
                'phone' => '+96824560000',
                'email' => 'fleet@wadi-trade.test',
                'tax_number' => 'OM-VAT-CORP-001',
                'address' => 'مسقط، سلطنة عمان',
                'is_active' => true,
            ]
        );
        $company->wasRecentlyCreated ? $created++ : $updated++;

        return $company;
    }

    protected function seedPrimaryCustomer(Company $company, int &$created, int &$updated): Customer
    {
        $customer = Customer::query()->updateOrCreate(
            ['phone' => '+96891234567'],
            [
                'name' => 'علي البلوشي',
                'email' => 'ali.customer@example.com',
                'status' => CustomerStatus::Active,
                'loyalty_points_balance' => 120,
            ]
        );
        $customer->wasRecentlyCreated ? $created++ : $updated++;

        return $customer;
    }

    /**
     * @return array<int, Customer>
     */
    protected function seedExtraCustomers(int &$created, int &$updated): array
    {
        $specs = [
            ['name' => 'فاطمة الهنائية', 'phone' => '+96891112233', 'email' => 'fatima@example.com'],
            ['name' => 'خالد المعمري', 'phone' => '+96892223344', 'email' => 'khalid@example.com'],
            ['name' => 'مريم الشحية', 'phone' => '+96893334455', 'email' => 'mariam@example.com'],
            ['name' => 'سعود الكندي', 'phone' => '+96894445566', 'email' => 'saud@example.com'],
        ];

        $customers = [];
        foreach ($specs as $spec) {
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
     * @param  array<int, Customer>  $extraCustomers
     * @return array<int, Vehicle>
     */
    protected function seedVehicles(Customer $primary, array $extraCustomers, int &$created, int &$updated): array
    {
        $primaryVehicle = Vehicle::query()->updateOrCreate(
            ['plate_number' => '1234 ب'],
            [
                'customer_id' => $primary->id,
                'brand' => 'Toyota',
                'model' => 'Land Cruiser',
                'color' => 'white',
                'vehicle_type' => VehicleType::Suv,
                'year' => 2023,
                'is_active' => true,
            ]
        );
        $primaryVehicle->wasRecentlyCreated ? $created++ : $updated++;

        $extraSpecs = [
            ['plate' => '5678 م', 'brand' => 'Hyundai', 'model' => 'Elantra', 'type' => VehicleType::Sedan, 'idx' => 0],
            ['plate' => '9012 ص', 'brand' => 'Nissan', 'model' => 'Patrol', 'type' => VehicleType::Suv, 'idx' => 1],
            ['plate' => '3456 س', 'brand' => 'Mitsubishi', 'model' => 'L200', 'type' => VehicleType::Truck, 'idx' => 2],
            ['plate' => '7890 خ', 'brand' => 'Honda', 'model' => 'Accord', 'type' => VehicleType::Sedan, 'idx' => 3],
        ];

        $vehicles = [$primaryVehicle];
        foreach ($extraSpecs as $spec) {
            $vehicle = Vehicle::query()->updateOrCreate(
                ['plate_number' => $spec['plate']],
                [
                    'customer_id' => $extraCustomers[$spec['idx']]->id,
                    'brand' => $spec['brand'],
                    'model' => $spec['model'],
                    'color' => 'أبيض',
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
     * @param  array<string, Branch>  $branches
     */
    protected function seedExpenses(array $branches, float $vatRate, int &$created, int &$updated): void
    {
        if (! Schema::hasTable('expenses')) {
            return;
        }

        $branch = $branches['khawr'];

        foreach (self::EXPENSES as $spec) {
            $vatAmount = $spec['vat'] ? round($spec['amount'] * ($vatRate / 100), 3) : 0;

            $expense = Expense::query()->updateOrCreate(
                ['reference_number' => self::PREFIX.$spec['ref']],
                [
                    'branch_id' => $branch->id,
                    'category' => $spec['category'],
                    'description' => $spec['description'],
                    'amount' => $spec['amount'],
                    'vat_amount' => $vatAmount,
                    'vat_rate' => $spec['vat'] ? $vatRate : 0,
                    'is_vat_recoverable' => $spec['vat'],
                    'expense_date' => now()->subDays(array_search($spec['ref'], array_column(self::EXPENSES, 'ref'), true) + 1)->toDateString(),
                    'vendor_name' => 'مورد محلي',
                    'status' => ExpenseStatus::Approved,
                ]
            );
            $expense->wasRecentlyCreated ? $created++ : $updated++;
        }
    }

    /**
     * @param  array<string, Branch>  $branches
     * @param  array<string, Service>  $services
     * @param  array<string, TenantUser>  $workers
     * @param  array<string, TenantUser>  $cashiers
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     */
    protected function seedHistoricalOrders(
        array $branches,
        array $services,
        array $workers,
        array $cashiers,
        array $customers,
        array $vehicles,
        float $vatRate,
        int &$created,
        int &$updated,
    ): void {
        $branchCodes = array_keys($branches);
        $serviceList = array_values($services);
        $workerList = array_values($workers);
        $paymentMethods = PaymentMethod::query()->whereIn('code', ['cash', 'card', 'bank_transfer'])->get()->keyBy('code');

        for ($i = 1; $i <= 22; $i++) {
            $branchCode = $branchCodes[$i % 3];
            $branch = $branches[$branchCode];
            $cashier = $cashiers[$branchCode];
            $customer = $customers[$i % count($customers)];
            $vehicle = $vehicles[$i % count($vehicles)];
            $service = $serviceList[$i % count($serviceList)];
            $worker = $workerList[$i % count($workerList)];
            $daysAgo = $i % 7;
            $completedAt = now()->subDays($daysAgo)->setHour(10 + ($i % 8));

            $price = (float) ServiceVehicleTypePrice::query()
                ->where('service_id', $service->id)
                ->where('vehicle_type', $vehicle->vehicle_type)
                ->value('price') ?: (float) $service->base_price;

            $tax = round($price * ($vatRate / 100), 3);
            $total = round($price + $tax, 3);

            $order = Order::query()->updateOrCreate(
                ['order_number' => self::PREFIX.'ORD-HIST-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT)],
                [
                    'branch_id' => $branch->id,
                    'customer_id' => $customer->id,
                    'vehicle_id' => $vehicle->id,
                    'worker_id' => $worker->id,
                    'status' => OrderStatus::Completed,
                    'source' => $i % 3 === 0 ? OrderSource::Booking : OrderSource::WalkIn,
                    'subtotal' => $price,
                    'discount_amount' => 0,
                    'tax_amount' => $tax,
                    'total_amount' => $total,
                    'completed_at' => $completedAt,
                    'created_at' => $completedAt,
                    'updated_at' => $completedAt,
                ]
            );
            $order->wasRecentlyCreated ? $created++ : $updated++;

            OrderItem::query()->updateOrCreate(
                ['order_id' => $order->id, 'service_id' => $service->id],
                [
                    'item_type' => OrderItemType::Service,
                    'name' => $service->name_ar,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'discount_amount' => 0,
                    'tax_amount' => $tax,
                    'total_price' => $total,
                    'worker_id' => $worker->id,
                    'status' => 'completed',
                ]
            );

            if ($i <= 6) {
                $invoice = Invoice::query()->updateOrCreate(
                    ['invoice_number' => self::PREFIX.'INV-HIST-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT)],
                    [
                        'order_id' => $order->id,
                        'customer_id' => $customer->id,
                        'branch_id' => $branch->id,
                        'status' => InvoiceStatus::Paid,
                        'payment_status' => InvoicePaymentStatus::Paid,
                        'issue_date' => $completedAt->toDateString(),
                        'subtotal' => $price,
                        'discount_amount' => 0,
                        'vat_rate' => $vatRate,
                        'vat_amount' => $tax,
                        'total' => $total,
                        'customer_name' => $customer->name,
                        'customer_phone' => $customer->phone,
                        'customer_email' => $customer->email,
                        'issued_by' => $cashier->id,
                    ]
                );
                $invoice->wasRecentlyCreated ? $created++ : $updated++;

                $methodCode = match ($i % 3) {
                    0 => 'cash',
                    1 => 'card',
                    default => 'bank_transfer',
                };

                if ($paymentMethods->has($methodCode)) {
                    Payment::query()->updateOrCreate(
                        ['reference_number' => self::PREFIX.'PAY-HIST-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT)],
                        [
                            'invoice_id' => $invoice->id,
                            'order_id' => $order->id,
                            'payment_method_id' => $paymentMethods[$methodCode]->id,
                            'branch_id' => $branch->id,
                            'amount' => $total,
                            'paid_at' => $completedAt,
                            'status' => PaymentStatus::Completed,
                            'received_by' => $cashier->id,
                        ]
                    );
                }
            }
        }

        $this->seedCorporateInvoice($branches['khawr'], $cashiers['khawr'], $services['full-wash'], $vatRate, $created, $updated);
        $this->seedCancelledAndRefundedOrders($branches, $customers, $vehicles, $services, $workers, $cashiers, $vatRate, $created, $updated);
    }

    protected function seedCorporateInvoice(
        Branch $branch,
        TenantUser $cashier,
        Service $service,
        float $vatRate,
        int &$created,
        int &$updated,
    ): void {
        $company = Company::query()->where('name', 'شركة الوادي للتجارة')->first();
        if (! $company) {
            return;
        }

        $corpCustomer = Customer::query()->updateOrCreate(
            ['phone' => '+96824560001'],
            [
                'name' => 'شركة الوادي للتجارة — أسطول',
                'email' => 'fleet@wadi-trade.test',
                'status' => CustomerStatus::Active,
                'company_id' => $company->id,
            ]
        );

        $price = 7.5;
        $tax = round($price * ($vatRate / 100), 3);
        $total = round($price + $tax, 3);

        $order = Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-CORP-001'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $corpCustomer->id,
                'status' => OrderStatus::Completed,
                'source' => OrderSource::Phone,
                'subtotal' => $price,
                'tax_amount' => $tax,
                'total_amount' => $total,
                'completed_at' => now()->subDays(2),
                'notes' => 'فاتورة شركات — أسطول مركبات',
            ]
        );

        Invoice::query()->updateOrCreate(
            ['invoice_number' => self::PREFIX.'INV-CORP-001'],
            [
                'order_id' => $order->id,
                'customer_id' => $corpCustomer->id,
                'branch_id' => $branch->id,
                'status' => InvoiceStatus::Paid,
                'payment_status' => InvoicePaymentStatus::Paid,
                'issue_date' => now()->subDays(2)->toDateString(),
                'subtotal' => $price,
                'vat_rate' => $vatRate,
                'vat_amount' => $tax,
                'total' => $total,
                'customer_name' => $company->name,
                'customer_phone' => $company->phone,
                'customer_email' => $company->email,
                'vatin' => $company->tax_number,
                'notes' => 'فاتورة شركات',
                'issued_by' => $cashier->id,
            ]
        );

        $created += 2;
    }

    /**
     * @param  array<string, Branch>  $branches
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @param  array<string, Service>  $services
     * @param  array<string, TenantUser>  $workers
     * @param  array<string, TenantUser>  $cashiers
     */
    protected function seedCancelledAndRefundedOrders(
        array $branches,
        array $customers,
        array $vehicles,
        array $services,
        array $workers,
        array $cashiers,
        float $vatRate,
        int &$created,
        int &$updated,
    ): void {
        $branch = $branches['khawr'];
        $service = $services['exterior-wash'];
        $price = 4.0;
        $tax = round($price * ($vatRate / 100), 3);
        $total = round($price + $tax, 3);

        Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-CANCEL-001'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[1]->id,
                'worker_id' => array_values($workers)[0]->id,
                'status' => OrderStatus::Cancelled,
                'source' => OrderSource::WalkIn,
                'subtotal' => $price,
                'tax_amount' => $tax,
                'total_amount' => $total,
                'cancelled_at' => now()->subDay(),
                'cancellation_reason' => 'الزبون غادر قبل بدء الخدمة',
            ]
        );

        $refundOrder = Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-REFUND-001'],
            [
                'branch_id' => $branch->id,
                'customer_id' => $customers[1]->id,
                'vehicle_id' => $vehicles[2]->id,
                'status' => OrderStatus::Completed,
                'source' => OrderSource::WalkIn,
                'subtotal' => $price,
                'tax_amount' => $tax,
                'total_amount' => $total,
                'completed_at' => now()->subDays(3),
            ]
        );

        Invoice::query()->updateOrCreate(
            ['invoice_number' => self::PREFIX.'INV-REFUND-001'],
            [
                'order_id' => $refundOrder->id,
                'customer_id' => $customers[1]->id,
                'branch_id' => $branch->id,
                'status' => InvoiceStatus::Refunded,
                'payment_status' => InvoicePaymentStatus::Paid,
                'issue_date' => now()->subDays(3)->toDateString(),
                'subtotal' => $price,
                'vat_rate' => $vatRate,
                'vat_amount' => $tax,
                'total' => $total,
                'customer_name' => $customers[1]->name,
                'customer_phone' => $customers[1]->phone,
                'notes' => 'استرداد — شكوى جودة',
                'issued_by' => $cashiers['khawr']->id,
            ]
        );

        $created += 3;
    }

    /**
     * @param  array<string, Branch>  $branches
     * @param  array<string, Service>  $services
     * @param  array<string, TenantUser>  $workers
     * @param  array<string, TenantUser>  $cashiers
     * @param  array<int, Customer>  $extraCustomers
     * @param  array<int, Vehicle>  $vehicles
     */
    protected function seedLiveScenario(
        array $branches,
        array $services,
        array $workers,
        array $cashiers,
        Customer $primaryCustomer,
        array $extraCustomers,
        array $vehicles,
        float $vatRate,
        int &$created,
        int &$updated,
    ): void {
        $today = now()->toDateString();
        $khawr = $branches['khawr'];
        $sohar = $branches['sohar'];
        $primaryVehicle = $vehicles[0];
        $workerList = array_values($workers);
        $exterior = $services['exterior-wash'];
        $full = $services['full-wash'];
        $allCustomers = array_merge([$primaryCustomer], $extraCustomers);

        $this->seedTodayBookings($khawr, $sohar, $allCustomers, $vehicles, $exterior, $full, $today, $created, $updated);
        $this->seedPastBookings($khawr, $sohar, $allCustomers, $vehicles, $exterior, $full, $created, $updated);
        $this->seedQueueBoard($khawr, $allCustomers, $vehicles, $today, $created, $updated);
        $this->seedWorkerAndCashierOrders(
            $khawr,
            $allCustomers,
            $vehicles,
            $services,
            $workerList,
            $cashiers['khawr'],
            $vatRate,
            $today,
            $created,
            $updated,
        );
        $this->seedAdditionalTodayOrders(
            $branches,
            $allCustomers,
            $vehicles,
            $services,
            $workerList,
            $cashiers,
            $vatRate,
            $today,
            $created,
            $updated,
        );
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     */
    protected function seedTodayBookings(
        Branch $khawr,
        Branch $sohar,
        array $customers,
        array $vehicles,
        Service $exterior,
        Service $full,
        string $today,
        int &$created,
        int &$updated,
    ): void {
        $confirmedBooking = Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-CONFIRMED'],
            [
                'branch_id' => $khawr->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[0]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '10:00:00',
                'scheduled_end_time' => '10:40:00',
                'status' => BookingStatus::Confirmed,
                'source' => BookingSource::Online,
                'confirmed_at' => now()->subHours(1),
                'service_ids' => [$full->id],
                'notes' => 'حجز علي البلوشي — Land Cruiser',
            ]
        );
        $confirmedBooking->wasRecentlyCreated ? $created++ : $updated++;

        Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-PENDING'],
            [
                'branch_id' => $sohar->id,
                'customer_id' => $customers[1]->id,
                'vehicle_id' => $vehicles[2]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '15:00:00',
                'scheduled_end_time' => '15:20:00',
                'status' => BookingStatus::Pending,
                'source' => BookingSource::Phone,
                'service_ids' => [$exterior->id],
                'notes' => 'حجز معلق — ينتظر تأكيد الكاشير',
            ]
        );

        Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-TODAY-EVENING'],
            [
                'branch_id' => $khawr->id,
                'customer_id' => $customers[2]->id,
                'vehicle_id' => $vehicles[3]->id,
                'scheduled_date' => $today,
                'scheduled_start_time' => '18:30:00',
                'scheduled_end_time' => '19:10:00',
                'status' => BookingStatus::Confirmed,
                'source' => BookingSource::Admin,
                'confirmed_at' => now()->subHours(3),
                'service_ids' => [$full->id],
                'notes' => 'حجز مسائي — غسيل كامل',
            ]
        );

        $created += 2;
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     */
    protected function seedPastBookings(
        Branch $khawr,
        Branch $sohar,
        array $customers,
        array $vehicles,
        Service $exterior,
        Service $full,
        int &$created,
        int &$updated,
    ): void {
        $yesterday = now()->subDay()->toDateString();
        $lastWeek = now()->subDays(5)->toDateString();

        Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-PAST-COMPLETED'],
            [
                'branch_id' => $khawr->id,
                'customer_id' => $customers[3]->id,
                'vehicle_id' => $vehicles[4]->id,
                'scheduled_date' => $yesterday,
                'scheduled_start_time' => '11:00:00',
                'scheduled_end_time' => '11:40:00',
                'status' => BookingStatus::Completed,
                'source' => BookingSource::Online,
                'completed_at' => now()->subDay()->setHour(12),
                'service_ids' => [$full->id],
                'notes' => 'حجز مكتمل — أمس',
            ]
        );

        Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-PAST-CANCELLED'],
            [
                'branch_id' => $sohar->id,
                'customer_id' => $customers[4]->id,
                'vehicle_id' => $vehicles[1]->id,
                'scheduled_date' => $lastWeek,
                'scheduled_start_time' => '09:00:00',
                'scheduled_end_time' => '09:20:00',
                'status' => BookingStatus::Cancelled,
                'source' => BookingSource::Phone,
                'service_ids' => [$exterior->id],
                'notes' => 'ألغى الزبون — سفر مفاجئ',
            ]
        );

        Booking::query()->updateOrCreate(
            ['booking_number' => self::PREFIX.'BK-PAST-SOHAR'],
            [
                'branch_id' => $sohar->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[0]->id,
                'scheduled_date' => $lastWeek,
                'scheduled_start_time' => '16:00:00',
                'scheduled_end_time' => '16:40:00',
                'status' => BookingStatus::Completed,
                'source' => BookingSource::WalkIn,
                'completed_at' => now()->subDays(5)->setHour(17),
                'service_ids' => [$full->id],
                'notes' => 'حجز فرع صحار — مكتمل',
            ]
        );

        $created += 3;
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     */
    protected function seedQueueBoard(
        Branch $khawr,
        array $customers,
        array $vehicles,
        string $today,
        int &$created,
        int &$updated,
    ): void {
        $waitingSpecs = [
            ['number' => 101, 'customer' => 0, 'vehicle' => 0, 'source' => QueueSource::WalkIn, 'notes' => 'علي البلوشي — 1234 ب', 'wait' => 20],
            ['number' => 103, 'customer' => 1, 'vehicle' => 2, 'source' => QueueSource::Booked, 'notes' => 'حجز — غسيل خارجي', 'wait' => 25],
            ['number' => 104, 'customer' => 2, 'vehicle' => 3, 'source' => QueueSource::WalkIn, 'notes' => 'حضور مباشر — SUV', 'wait' => 30],
            ['number' => 105, 'customer' => 3, 'vehicle' => 4, 'source' => QueueSource::WalkIn, 'notes' => 'اشتراك شهري', 'wait' => 35],
            ['number' => 106, 'customer' => 4, 'vehicle' => 1, 'source' => QueueSource::Booked, 'notes' => 'حجز أونلاين — غسيل كامل', 'wait' => 40],
            ['number' => 107, 'customer' => 0, 'vehicle' => 1, 'source' => QueueSource::WalkIn, 'notes' => 'Patrol — غسيل داخلي', 'wait' => 45],
            ['number' => 108, 'customer' => 1, 'vehicle' => 2, 'source' => QueueSource::WalkIn, 'notes' => 'شركة — أسطول', 'wait' => 50],
        ];

        foreach ($waitingSpecs as $spec) {
            $this->upsertQueueEntry($khawr->id, $today, $spec['number'], [
                'source' => $spec['source'],
                'customer_id' => $customers[$spec['customer']]->id,
                'vehicle_id' => $vehicles[$spec['vehicle']]->id,
                'status' => QueueEntryStatus::Waiting,
                'estimated_wait_minutes' => $spec['wait'],
                'priority' => $spec['source'] === QueueSource::Booked ? 10 : 0,
                'notes' => $spec['notes'],
            ], $created, $updated);
        }

        $this->upsertQueueEntry($khawr->id, $today, 102, [
            'source' => QueueSource::Booked,
            'customer_id' => $customers[0]->id,
            'vehicle_id' => $vehicles[0]->id,
            'status' => QueueEntryStatus::InService,
            'in_service_at' => now()->subMinutes(20),
            'estimated_wait_minutes' => 0,
            'notes' => 'قيد الغسيل — Bay 1',
        ], $created, $updated);

        $this->upsertQueueEntry($khawr->id, $today, 100, [
            'source' => QueueSource::WalkIn,
            'customer_id' => $customers[2]->id,
            'vehicle_id' => $vehicles[3]->id,
            'status' => QueueEntryStatus::Completed,
            'completed_at' => now()->subHours(2),
            'estimated_wait_minutes' => 0,
            'notes' => 'مكتمل — تم التسليم',
        ], $created, $updated);
    }

    /**
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @param  array<string, Service>  $services
     * @param  array<int, TenantUser>  $workerList
     */
    protected function seedWorkerAndCashierOrders(
        Branch $khawr,
        array $customers,
        array $vehicles,
        array $services,
        array $workerList,
        TenantUser $cashier,
        float $vatRate,
        string $today,
        int &$created,
        int &$updated,
    ): void {
        $exterior = $services['exterior-wash'];
        $full = $services['full-wash'];
        $priceExterior = 4.0;
        $taxExterior = round($priceExterior * ($vatRate / 100), 3);
        $totalExterior = round($priceExterior + $taxExterior, 3);

        $inServiceEntry = QueueEntry::query()
            ->where('branch_id', $khawr->id)
            ->whereDate('queue_date', $today)
            ->where('queue_number', 102)
            ->first();

        $liveAt = now()->subMinutes(20);
        $liveOrder = Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-LIVE-001'],
            $this->withTodayTimestamps([
                'branch_id' => $khawr->id,
                'customer_id' => $customers[0]->id,
                'vehicle_id' => $vehicles[0]->id,
                'queue_entry_id' => $inServiceEntry?->id,
                'worker_id' => $workerList[0]->id,
                'status' => OrderStatus::InService,
                'source' => OrderSource::WalkIn,
                'subtotal' => $priceExterior,
                'tax_amount' => $taxExterior,
                'total_amount' => $totalExterior,
                'in_service_at' => $liveAt,
            ], $liveAt)
        );
        $inServiceEntry?->update(['order_id' => $liveOrder->id]);

        OrderItem::query()->updateOrCreate(
            ['order_id' => $liveOrder->id, 'service_id' => $exterior->id],
            [
                'item_type' => OrderItemType::Service,
                'name' => $exterior->name_ar,
                'quantity' => 1,
                'unit_price' => $priceExterior,
                'tax_amount' => $taxExterior,
                'total_price' => $totalExterior,
                'worker_id' => $workerList[0]->id,
                'status' => 'in_progress',
            ]
        );

        Invoice::query()->updateOrCreate(
            ['invoice_number' => self::PREFIX.'INV-LIVE-001'],
            [
                'order_id' => $liveOrder->id,
                'customer_id' => $customers[0]->id,
                'branch_id' => $khawr->id,
                'status' => InvoiceStatus::Issued,
                'payment_status' => InvoicePaymentStatus::Unpaid,
                'issue_date' => $today,
                'subtotal' => $priceExterior,
                'vat_rate' => $vatRate,
                'vat_amount' => $taxExterior,
                'total' => $totalExterior,
                'customer_name' => $customers[0]->name,
                'customer_phone' => $customers[0]->phone,
                'customer_email' => $customers[0]->email,
                'issued_by' => $cashier->id,
            ]
        );

        Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-QUEUED-001'],
            $this->withTodayTimestamps([
                'branch_id' => $khawr->id,
                'customer_id' => $customers[1]->id,
                'vehicle_id' => $vehicles[2]->id,
                'worker_id' => $workerList[1]->id,
                'status' => OrderStatus::Queued,
                'source' => OrderSource::WalkIn,
                'subtotal' => $priceExterior,
                'tax_amount' => $taxExterior,
                'total_amount' => $totalExterior,
                'queued_at' => now()->subMinutes(10),
            ], now()->subMinutes(10))
        );

        $priceFull = 7.5;
        $taxFull = round($priceFull * ($vatRate / 100), 3);
        $totalFull = round($priceFull + $taxFull, 3);

        $readyAt = now()->subMinutes(5);
        $readyOrder = Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-READY-001'],
            $this->withTodayTimestamps([
                'branch_id' => $khawr->id,
                'customer_id' => $customers[2]->id,
                'vehicle_id' => $vehicles[3]->id,
                'worker_id' => $workerList[2]->id,
                'status' => OrderStatus::Ready,
                'source' => OrderSource::Booking,
                'subtotal' => $priceFull,
                'tax_amount' => $taxFull,
                'total_amount' => $totalFull,
                'ready_at' => $readyAt,
            ], $readyAt)
        );

        Invoice::query()->updateOrCreate(
            ['invoice_number' => self::PREFIX.'INV-READY-001'],
            [
                'order_id' => $readyOrder->id,
                'customer_id' => $customers[2]->id,
                'branch_id' => $khawr->id,
                'status' => InvoiceStatus::Issued,
                'payment_status' => InvoicePaymentStatus::Unpaid,
                'issue_date' => $today,
                'subtotal' => $priceFull,
                'vat_rate' => $vatRate,
                'vat_amount' => $taxFull,
                'total' => $totalFull,
                'customer_name' => $customers[2]->name,
                'customer_phone' => $customers[2]->phone,
                'issued_by' => $cashier->id,
                'notes' => 'جاهز للدفع — الكاشير',
            ]
        );

        Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-QC-001'],
            $this->withTodayTimestamps([
                'branch_id' => $khawr->id,
                'customer_id' => $customers[3]->id,
                'vehicle_id' => $vehicles[4]->id,
                'worker_id' => $workerList[3]->id,
                'status' => OrderStatus::QualityCheck,
                'source' => OrderSource::WalkIn,
                'subtotal' => $priceFull,
                'tax_amount' => $taxFull,
                'total_amount' => $totalFull,
                'quality_check_at' => now()->subMinutes(3),
            ], now()->subMinutes(3))
        );

        $paidSubtotal = 6.0;
        $paidTax = round($paidSubtotal * ($vatRate / 100), 3);
        $paidTotal = round($paidSubtotal + $paidTax, 3);

        $paidAt = now()->subHours(1);
        $paidOrder = Order::query()->updateOrCreate(
            ['order_number' => self::PREFIX.'ORD-TODAY-PAID'],
            $this->withTodayTimestamps([
                'branch_id' => $khawr->id,
                'customer_id' => $customers[4]->id,
                'vehicle_id' => $vehicles[1]->id,
                'worker_id' => $workerList[4]->id,
                'status' => OrderStatus::Completed,
                'source' => OrderSource::WalkIn,
                'subtotal' => $paidSubtotal,
                'tax_amount' => $paidTax,
                'total_amount' => $paidTotal,
                'completed_at' => $paidAt,
            ], $paidAt)
        );

        $paidInvoice = Invoice::query()->updateOrCreate(
            ['invoice_number' => self::PREFIX.'INV-TODAY-PAID'],
            [
                'order_id' => $paidOrder->id,
                'customer_id' => $customers[4]->id,
                'branch_id' => $khawr->id,
                'status' => InvoiceStatus::Paid,
                'payment_status' => InvoicePaymentStatus::Paid,
                'issue_date' => $today,
                'subtotal' => $paidSubtotal,
                'vat_rate' => $vatRate,
                'vat_amount' => $paidTax,
                'total' => $paidTotal,
                'customer_name' => $customers[4]->name,
                'customer_phone' => $customers[4]->phone,
                'issued_by' => $cashier->id,
            ]
        );

        $cashMethod = PaymentMethod::query()->where('code', 'cash')->first();
        if ($cashMethod) {
            Payment::query()->updateOrCreate(
                ['reference_number' => self::PREFIX.'PAY-TODAY-001'],
                [
                    'invoice_id' => $paidInvoice->id,
                    'order_id' => $paidOrder->id,
                    'payment_method_id' => $cashMethod->id,
                    'branch_id' => $khawr->id,
                    'amount' => $paidTotal,
                    'paid_at' => now()->subMinutes(50),
                    'status' => PaymentStatus::Completed,
                    'received_by' => $cashier->id,
                ]
            );
        }

        $created += 8;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function upsertQueueEntry(
        int $branchId,
        string $queueDate,
        int $queueNumber,
        array $payload,
        int &$created,
        int &$updated,
    ): QueueEntry {
        $entry = QueueEntry::query()
            ->where('branch_id', $branchId)
            ->whereDate('queue_date', $queueDate)
            ->where('queue_number', $queueNumber)
            ->first();

        if ($entry) {
            $entry->update($payload);
            $updated++;

            return $entry;
        }

        $created++;

        return QueueEntry::query()->create($payload + [
            'branch_id' => $branchId,
            'queue_date' => $queueDate,
            'queue_number' => $queueNumber,
        ]);
    }

    /**
     * Create additional orders for today to ensure rich dashboard data
     *
     * @param  array<string, Branch>  $branches
     * @param  array<int, Customer>  $customers
     * @param  array<int, Vehicle>  $vehicles
     * @param  array<string, Service>  $services
     * @param  array<int, TenantUser>  $workerList
     * @param  array<string, TenantUser>  $cashiers
     */
    protected function seedAdditionalTodayOrders(
        array $branches,
        array $customers,
        array $vehicles,
        array $services,
        array $workerList,
        array $cashiers,
        float $vatRate,
        string $today,
        int &$created,
        int &$updated,
    ): void {
        $exterior = $services['exterior-wash'];
        $full = $services['full-wash'];
        $interior = $services['interior-detail'];
        $branchList = array_values($branches);
        $branchCodes = array_keys($branches);

        $specifications = [
            // Completed orders (paid)
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 4],
            ['service' => $full, 'price' => 7.5, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 3],
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 2],
            ['service' => $full, 'price' => 7.5, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 2.5],
            
            // Ready orders (unpaid)
            ['service' => $interior, 'price' => 5.0, 'status' => OrderStatus::Ready, 'inv_status' => InvoicePaymentStatus::Unpaid, 'minutes_ago' => 30],
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Ready, 'inv_status' => InvoicePaymentStatus::Unpaid, 'minutes_ago' => 15],
            
            // In Quality Check
            ['service' => $full, 'price' => 7.5, 'status' => OrderStatus::QualityCheck, 'inv_status' => InvoicePaymentStatus::Unpaid, 'minutes_ago' => 8],
            ['service' => $interior, 'price' => 5.0, 'status' => OrderStatus::QualityCheck, 'inv_status' => InvoicePaymentStatus::Unpaid, 'minutes_ago' => 5],

            // More in_service and queued for realistic queue
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Queued, 'inv_status' => null, 'minutes_ago' => 12],
            ['service' => $full, 'price' => 7.5, 'status' => OrderStatus::Queued, 'inv_status' => null, 'minutes_ago' => 8],
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Queued, 'inv_status' => null, 'minutes_ago' => 5],
            ['service' => $interior, 'price' => 5.0, 'status' => OrderStatus::Queued, 'inv_status' => null, 'minutes_ago' => 3],
            
            // Additional completed orders
            ['service' => $exterior, 'price' => 4.0, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 5.5],
            ['service' => $full, 'price' => 7.5, 'status' => OrderStatus::Completed, 'inv_status' => InvoicePaymentStatus::Paid, 'hours_ago' => 4.5],
        ];

        foreach ($specifications as $idx => $spec) {
            $service = $spec['service'];
            $price = $spec['price'];
            $tax = round($price * ($vatRate / 100), 3);
            $total = round($price + $tax, 3);
            
            $customerIdx = ($idx + 1) % count($customers);
            $vehicleIdx = ($idx + 2) % count($vehicles);
            $workerIdx = ($idx + 3) % count($workerList);

            $customer = $customers[$customerIdx];
            $vehicle = $vehicles[$vehicleIdx];
            $worker = $workerList[$workerIdx];
            $branch = $branchList[$idx % count($branchList)];
            $branchCode = $branchCodes[$idx % count($branchCodes)];
            $cashier = $cashiers[$branchCode] ?? reset($cashiers);

            $completedAt = now();
            if (isset($spec['hours_ago'])) {
                $completedAt = $completedAt->subHours($spec['hours_ago']);
            } elseif (isset($spec['minutes_ago'])) {
                $completedAt = $completedAt->subMinutes($spec['minutes_ago']);
            }

            $orderNumber = self::PREFIX . 'ORD-EXTRA-' . str_pad((string) ($idx + 1), 3, '0', STR_PAD_LEFT);

            $order = Order::query()->updateOrCreate(
                ['order_number' => $orderNumber],
                $this->withTodayTimestamps([
                    'branch_id' => $branch->id,
                    'customer_id' => $customer->id,
                    'vehicle_id' => $vehicle->id,
                    'worker_id' => $worker->id,
                    'status' => $spec['status'],
                    'source' => $idx % 2 === 0 ? OrderSource::WalkIn : OrderSource::Booking,
                    'subtotal' => $price,
                    'tax_amount' => $tax,
                    'total_amount' => $total,
                    'completed_at' => in_array($spec['status'], [OrderStatus::Completed, OrderStatus::Ready, OrderStatus::QualityCheck]) ? $completedAt : null,
                    'ready_at' => $spec['status'] === OrderStatus::Ready ? $completedAt : null,
                    'quality_check_at' => $spec['status'] === OrderStatus::QualityCheck ? $completedAt : null,
                    'queued_at' => $spec['status'] === OrderStatus::Queued ? $completedAt : null,
                    'in_service_at' => $spec['status'] === OrderStatus::InService ? $completedAt : null,
                ], $completedAt)
            );
            $order->wasRecentlyCreated ? $created++ : $updated++;

            OrderItem::query()->updateOrCreate(
                ['order_id' => $order->id, 'service_id' => $service->id],
                [
                    'item_type' => OrderItemType::Service,
                    'name' => $service->name_ar,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'tax_amount' => $tax,
                    'total_price' => $total,
                    'worker_id' => $worker->id,
                    'status' => $spec['status'] === OrderStatus::Completed ? 'completed' : 'in_progress',
                ]
            );

            // Create invoice only for orders that should have one
            if ($spec['inv_status'] !== null) {
                $invoiceNumber = self::PREFIX . 'INV-EXTRA-' . str_pad((string) ($idx + 1), 3, '0', STR_PAD_LEFT);
                $invStatus = $spec['inv_status'] === InvoicePaymentStatus::Paid ? InvoiceStatus::Paid : InvoiceStatus::Issued;

                $invoice = Invoice::query()->updateOrCreate(
                    ['invoice_number' => $invoiceNumber],
                    [
                        'order_id' => $order->id,
                        'customer_id' => $customer->id,
                        'branch_id' => $branch->id,
                        'status' => $invStatus,
                        'payment_status' => $spec['inv_status'],
                        'issue_date' => $today,
                        'subtotal' => $price,
                        'vat_rate' => $vatRate,
                        'vat_amount' => $tax,
                        'total' => $total,
                        'customer_name' => $customer->name,
                        'customer_phone' => $customer->phone,
                        'customer_email' => $customer->email,
                        'issued_by' => $cashier->id,
                        'created_at' => $completedAt,
                        'updated_at' => $completedAt,
                    ]
                );
                $invoice->wasRecentlyCreated ? $created++ : $updated++;

                // Create payment for paid invoices
                if ($spec['inv_status'] === InvoicePaymentStatus::Paid) {
                    $paymentMethods = PaymentMethod::query()->whereIn('code', ['cash', 'card', 'bank_transfer'])->get()->keyBy('code');
                    $methodCode = match ($idx % 3) {
                        0 => 'cash',
                        1 => 'card',
                        default => 'bank_transfer',
                    };

                    if ($paymentMethods->has($methodCode)) {
                        Payment::query()->updateOrCreate(
                            ['reference_number' => self::PREFIX . 'PAY-EXTRA-' . str_pad((string) ($idx + 1), 3, '0', STR_PAD_LEFT)],
                            [
                                'invoice_id' => $invoice->id,
                                'order_id' => $order->id,
                                'payment_method_id' => $paymentMethods[$methodCode]->id,
                                'branch_id' => $branch->id,
                                'amount' => $total,
                                'paid_at' => $completedAt,
                                'status' => PaymentStatus::Completed,
                                'received_by' => $cashier->id,
                                'created_at' => $completedAt,
                                'updated_at' => $completedAt,
                            ]
                        );
                    }
                }
            }
        }
    }

    /**
     * Ensure demo orders always count toward today's dashboard filters on re-seed.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    protected function withTodayTimestamps(array $attributes, \DateTimeInterface $at): array
    {
        return array_merge($attributes, [
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }
}
