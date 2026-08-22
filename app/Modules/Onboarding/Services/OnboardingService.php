<?php

namespace App\Modules\Onboarding\Services;

use App\Models\User;
use App\Modules\Branches\Models\Branch;
use App\Modules\Customers\Models\Customer;
use App\Modules\Finance\Models\PaymentMethod;
use App\Modules\Finance\Models\TaxSettings;
use App\Modules\Onboarding\Models\OnboardingProgress;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use Illuminate\Support\Facades\DB;

class OnboardingService
{
    protected User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Initialize onboarding for a new user
     */
    public function initialize(): OnboardingProgress
    {
        return OnboardingProgress::updateOrCreate(
            ['user_id' => $this->user->id],
            [
                'current_step' => 1,
                'total_steps' => 7,
                'status' => 'in_progress',
                'started_at' => now(),
                'completed_steps' => [],
                'step_data' => [],
            ]
        );
    }

    /**
     * Get current onboarding progress
     */
    public function getProgress(): ?OnboardingProgress
    {
        return OnboardingProgress::where('user_id', $this->user->id)->first();
    }

    /**
     * Save business info (Step 1)
     */
    public function saveBusinessInfo(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        $this->user->update([
            'name' => $data['business_name'] ?? $this->user->name,
            'email' => $data['email'] ?? $this->user->email,
        ]);

        $progress->markStepCompleted(1, [
            'business_name' => $data['business_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
        ]);

        return $progress;
    }

    /**
     * Save first branch/location (Step 2)
     */
    public function saveFirstBranch(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        $workingHours = [];
        if (isset($data['working_hours']) && is_array($data['working_hours'])) {
            foreach ($data['working_hours'] as $day => $hours) {
                if ($hours['is_open'] ?? false) {
                    $workingHours[$day] = [
                        'start_time' => $hours['start_time'],
                        'end_time' => $hours['end_time'],
                    ];
                }
            }
        }

        $branch = Branch::create([
            'name' => $data['branch_name'] ?? 'Main Branch',
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'is_active' => true,
            'status' => 'operational',
        ]);

        $progress->markStepCompleted(2, [
            'branch_id' => $branch->id,
            'branch_name' => $branch->name,
            'address' => $branch->address,
            'city' => $branch->city,
            'phone' => $branch->phone,
            'email' => $branch->email,
            'working_hours' => $workingHours,
        ]);

        return $progress;
    }

    /**
     * Save services setup (Step 3)
     */
    public function saveServices(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        // Get or create default service category
        $category = ServiceCategory::firstOrCreate([
            'name' => 'Standard Services',
            'slug' => 'standard-services',
        ]);

        $services = [];
        if (isset($data['services']) && is_array($data['services'])) {
            foreach ($data['services'] as $serviceData) {
                $service = Service::create([
                    'category_id' => $category->id,
                    'name' => $serviceData['name'] ?? 'Standard Wash',
                    'name_ar' => $serviceData['name_ar'] ?? 'غسيل قياسي',
                    'slug' => str()->slug($serviceData['name'] ?? 'standard-wash'),
                    'description' => $serviceData['description'] ?? null,
                    'duration_minutes' => $serviceData['duration_minutes'] ?? 30,
                    'base_price' => $serviceData['base_price'] ?? 3.00,
                    'vat_included' => $serviceData['vat_included'] ?? true,
                    'vat_rate' => 5.00, // Oman VAT
                    'is_active' => true,
                ]);

                $services[] = [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => $service->base_price,
                ];
            }
        }

        $progress->markStepCompleted(3, [
            'services' => $services,
            'category_id' => $category->id,
        ]);

        return $progress;
    }

    /**
     * Save staff setup (Step 4)
     */
    public function saveStaff(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        $staffInfo = [
            'owner' => $data['owner'] ?? [
                'name' => $this->user->name,
                'role' => 'owner',
                'email' => $this->user->email,
            ],
            'staff_count' => $data['staff_count'] ?? 0,
            'staff_members' => $data['staff_members'] ?? [],
        ];

        $progress->markStepCompleted(4, $staffInfo);

        return $progress;
    }

    /**
     * Save payment methods (Step 5)
     */
    public function savePaymentMethods(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        $paymentMethods = [];
        if (isset($data['payment_methods']) && is_array($data['payment_methods'])) {
            foreach ($data['payment_methods'] as $method) {
                $pm = PaymentMethod::create([
                    'name' => $method['name'] ?? 'Payment Method',
                    'type' => $method['type'] ?? 'cash',
                    'is_active' => $method['is_active'] ?? true,
                ]);

                $paymentMethods[] = [
                    'id' => $pm->id,
                    'name' => $pm->name,
                    'type' => $pm->type,
                ];
            }
        }

        $progress->markStepCompleted(5, [
            'payment_methods' => $paymentMethods,
        ]);

        return $progress;
    }

    /**
     * Save tax setup (Step 6)
     */
    public function saveTaxSetup(array $data): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        // Update or create tax settings
        TaxSettings::updateOrCreate(
            [],
            [
                'vat_rate' => 5.00, // Oman VAT
                'vat_enabled' => $data['vat_enabled'] ?? true,
                'tax_id' => $data['tax_id'] ?? null,
                'country' => 'OM',
                'currency' => 'OMR',
            ]
        );

        $progress->markStepCompleted(6, [
            'vat_rate' => 5.00,
            'vat_enabled' => $data['vat_enabled'] ?? true,
            'country' => 'OM',
            'currency' => 'OMR',
        ]);

        return $progress;
    }

    /**
     * Complete onboarding (Step 7)
     */
    public function completeOnboarding(array $data = []): OnboardingProgress
    {
        $progress = $this->getProgress() ?? $this->initialize();

        $progress->markStepCompleted(7, $data);
        $progress->complete();

        // Auto-activate business
        $branch = Branch::find($progress->step_data[2]['branch_id'] ?? null);
        if ($branch) {
            $branch->update(['is_active' => true, 'status' => 'operational']);
        }

        return $progress;
    }

    /**
     * Get all onboarding data for review
     */
    public function getReviewData(): array
    {
        $progress = $this->getProgress();
        if (!$progress) {
            return [];
        }

        return [
            'business_info' => $progress->step_data[1] ?? [],
            'branch_info' => $progress->step_data[2] ?? [],
            'services' => $progress->step_data[3] ?? [],
            'staff' => $progress->step_data[4] ?? [],
            'payment_methods' => $progress->step_data[5] ?? [],
            'tax_setup' => $progress->step_data[6] ?? [],
            'progress' => $progress->getProgressPercentage(),
            'completed_steps' => $progress->completed_steps,
        ];
    }

    /**
     * Get suggested next actions after onboarding
     */
    public function getSuggestedActions(): array
    {
        $branchCount = Branch::count();
        $serviceCount = Service::count();
        $staffCount = User::where('id', '!=', $this->user->id)->count();

        $suggestions = [];

        if ($branchCount < 2) {
            $suggestions[] = [
                'title' => 'Add More Branches',
                'description' => 'Expand your business by adding additional locations',
                'icon' => 'building-2',
                'action' => 'branches.create',
                'priority' => 1,
            ];
        }

        if ($serviceCount < 3) {
            $suggestions[] = [
                'title' => 'Add More Services',
                'description' => 'Increase revenue by offering more car wash services',
                'icon' => 'sparkles',
                'action' => 'services.create',
                'priority' => 2,
            ];
        }

        if ($staffCount === 0) {
            $suggestions[] = [
                'title' => 'Invite Team Members',
                'description' => 'Add cashiers and workers to manage your business',
                'icon' => 'users',
                'action' => 'staff.invite',
                'priority' => 3,
            ];
        }

        return array_slice($suggestions, 0, 3);
    }
}
