<?php

namespace Database\Seeders;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Support\Facades\Schema;

class WashDemoLandlordSeeder extends IdempotentSeeder
{
    /** @var array<int, array<string, mixed>> */
    private const DEMO_TENANTS = [
        [
            'slug' => 'demo',
            'name' => 'مغسلة تمير التجريبية',
            'legal_name' => 'مغسلة تمير التجريبية',
            'email' => 'info@demo.test',
            'phone' => '+96824560000',
            'plan' => 'starter',
            'status' => 'active',
            'trial_days' => null,
        ],
        [
            'slug' => 'alwadi-wash',
            'name' => 'مغسلة الوادي',
            'legal_name' => 'مغسلة الوادي للسيارات',
            'email' => 'info@alwadi-wash.test',
            'phone' => '+96824567890',
            'plan' => 'professional',
            'status' => 'active',
            'trial_days' => null,
        ],
        [
            'slug' => 'alwadi-wash2df',
            'name' => 'مغسلة الوادي',
            'legal_name' => 'مغسلة الوادي للسيارات',
            'email' => 'info@alwadi-wash2df.test',
            'phone' => '+96824567891',
            'plan' => 'professional',
            'status' => 'active',
            'trial_days' => null,
        ],
        [
            'slug' => 'sohar-fast-wash',
            'name' => 'مغسلة صحار السريعة',
            'legal_name' => 'مغسلة صحار السريعة ش.م.م',
            'email' => 'info@sohar-fast.test',
            'phone' => '+96826876543',
            'plan' => 'starter',
            'status' => 'active',
            'trial_days' => 7,
        ],
        [
            'slug' => 'elite-detailing',
            'name' => 'مغسلة النخبة للعناية',
            'legal_name' => 'مغسلة النخبة للعناية بالسيارات',
            'email' => 'info@elite-detailing.test',
            'phone' => '+96824112233',
            'plan' => 'enterprise',
            'status' => 'active',
            'trial_days' => null,
        ],
    ];

    public function run(): void
    {
        if (! Schema::connection('landlord')->hasTable('plans')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'landlord tables missing']);

            return;
        }

        $created = 0;
        $updated = 0;

        $this->callSilent(LandlordProductionSeeder::class);

        $plans = Plan::query()->pluck('id', 'slug');
        $provisioning = app(TenantProvisioningService::class);

        foreach (self::DEMO_TENANTS as $spec) {
            $plan = $plans[$spec['plan']] ?? null;
            if (! $plan) {
                continue;
            }

            $tenant = Tenant::query()->updateOrCreate(
                ['slug' => $spec['slug']],
                [
                    'name' => $spec['name'],
                    'legal_name' => $spec['legal_name'],
                    'email' => $spec['email'],
                    'phone' => $spec['phone'],
                    'country' => 'OM',
                    'timezone' => 'Asia/Muscat',
                    'locale' => 'ar',
                    'status' => $spec['status'],
                    'plan_id' => $plan,
                    'trial_ends_at' => $spec['trial_days']
                        ? now()->addDays($spec['trial_days'])
                        : null,
                    'activated_at' => $spec['status'] === 'active' ? now()->subMonths(2) : null,
                ]
            );

            $tenant->wasRecentlyCreated ? $created++ : $updated++;

            $tenant->refresh();

            if (! $tenant->database?->isReady()) {
                try {
                    $provisioning->provision($tenant, [
                        'force' => ! $tenant->database?->isReady(),
                        'owner_email' => "owner@{$spec['slug']}.test",
                        'owner_password' => 'password',
                        'owner_name' => $spec['name'].' — المالك',
                    ]);
                    $tenant->refresh();
                } catch (\Throwable $e) {
                    if ($this->command) {
                        $this->command->warn("Provisioning {$spec['slug']}: {$e->getMessage()}");
                    }
                }
            }

            $this->seedSubscriptions($tenant, $spec, $plans, $created, $updated);

            if (in_array($spec['slug'], ['alwadi-wash', 'alwadi-wash2df'], true)) {
                $this->seedAlwadiBranding($tenant, $updated);
            }
        }

        $this->logResult(static::class, compact('created', 'updated') + [
            'skipped' => 0,
            'tenants' => collect(self::DEMO_TENANTS)->pluck('slug')->all(),
        ]);
    }

    /**
     * @param  array<string, string>  $plans
     */
    protected function seedSubscriptions(Tenant $tenant, array $spec, $plans, int &$created, int &$updated): void
    {
        $planId = $plans[$spec['plan']];
        $plan = Plan::query()->find($planId);
        if (! $plan) {
            return;
        }

        $amount = (float) $plan->price_monthly;

        if ($spec['slug'] === 'sohar-fast-wash') {
            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => 'wash-demo-sohar-trial'],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $planId,
                    'status' => 'trial',
                    'billing_cycle' => 'monthly',
                    'amount' => $amount,
                    'currency' => 'OMR',
                    'starts_at' => now()->subDays(2),
                    'ends_at' => now()->addDays(5),
                    'trial_ends_at' => now()->addDays(5),
                    'metadata' => ['scenario' => 'trial_starter'],
                ]
            );
            $created++;

            return;
        }

        if ($spec['slug'] === 'elite-detailing') {
            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => 'wash-demo-elite-cancelled-pro'],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plans['professional'] ?? $planId,
                    'status' => 'cancelled',
                    'billing_cycle' => 'monthly',
                    'amount' => 59.00,
                    'currency' => 'OMR',
                    'starts_at' => now()->subMonths(4),
                    'ends_at' => now()->subMonths(3),
                    'cancelled_at' => now()->subMonths(3),
                    'metadata' => ['scenario' => 'downgraded_from_enterprise', 'note' => 'ترقية لاحقة إلى Enterprise'],
                ]
            );

            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => 'wash-demo-elite-active'],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $planId,
                    'status' => 'active',
                    'billing_cycle' => 'monthly',
                    'amount' => $amount,
                    'currency' => 'OMR',
                    'starts_at' => now()->subMonths(3),
                    'ends_at' => now()->addDays(25),
                    'metadata' => ['scenario' => 'active_enterprise'],
                ]
            );
            $created += 2;

            return;
        }

        if (in_array($spec['slug'], ['alwadi-wash', 'alwadi-wash2df'], true)) {
            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => "wash-demo-{$spec['slug']}-cancelled-starter"],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plans['starter'] ?? $planId,
                    'status' => 'cancelled',
                    'billing_cycle' => 'monthly',
                    'amount' => 29.00,
                    'currency' => 'OMR',
                    'starts_at' => now()->subMonths(6),
                    'ends_at' => now()->subMonths(4),
                    'cancelled_at' => now()->subMonths(4),
                    'metadata' => ['scenario' => 'cancelled_starter'],
                ]
            );

            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => "wash-demo-{$spec['slug']}-upgrade-gap"],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plans['starter'] ?? $planId,
                    'status' => 'cancelled',
                    'billing_cycle' => 'monthly',
                    'amount' => 29.00,
                    'currency' => 'OMR',
                    'starts_at' => now()->subMonths(4),
                    'ends_at' => now()->subMonths(3),
                    'cancelled_at' => now()->subMonths(3),
                    'metadata' => ['scenario' => 'upgraded_professional', 'note' => 'ترقية إلى Professional'],
                ]
            );

            Subscription::query()->updateOrCreate(
                ['external_subscription_id' => "wash-demo-{$spec['slug']}-active-pro"],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $planId,
                    'status' => 'active',
                    'billing_cycle' => 'monthly',
                    'amount' => $amount,
                    'currency' => 'OMR',
                    'starts_at' => now()->subMonths(3),
                    'ends_at' => now()->addDays(20),
                    'metadata' => ['scenario' => 'active_professional', 'reactivated' => true],
                ]
            );
            $created += 3;

            return;
        }

        Subscription::query()->updateOrCreate(
            ['external_subscription_id' => "wash-demo-{$spec['slug']}-active"],
            [
                'tenant_id' => $tenant->id,
                'plan_id' => $planId,
                'status' => 'active',
                'billing_cycle' => 'monthly',
                'amount' => $amount,
                'currency' => 'OMR',
                'starts_at' => now()->subMonth(),
                'ends_at' => now()->addDays(25),
            ]
        );
        $created++;
    }

    protected function seedAlwadiBranding(Tenant $tenant, int &$updated): void
    {
        $settings = array_merge($tenant->settings ?? [], [
            'primary_color' => '#0d6e6e',
            'secondary_color' => '#0d9488',
            'tagline' => 'غسيل سيارات احترافي — مسقط · صحار · صحم',
            'about' => 'مغسلة الوادي للسيارات — خدمة غسيل وتلميع ونانو سيراميك منذ 2018. فروعنا في الخوير وصحار وصحم.',
            'social' => [
                'instagram' => 'https://instagram.com/alwadi_wash',
                'whatsapp' => 'https://wa.me/96824567890',
                'facebook' => 'https://facebook.com/alwadiwash',
            ],
        ]);

        $metadata = array_merge($tenant->metadata ?? [], [
            'demo_scenario' => 'alwadi_wash',
            'branding_seeded_at' => now()->toIso8601String(),
        ]);

        $tenant->update([
            'settings' => $settings,
            'metadata' => $metadata,
        ]);
        $updated++;
    }
}
