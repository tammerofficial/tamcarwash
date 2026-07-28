<?php

namespace App\Console\Commands;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;
use Illuminate\Console\Command;

class LandlordReportSubscriptionsCommand extends Command
{
    protected $signature = 'landlord:report-subscriptions
                            {--json : Output as JSON}';

    protected $description = 'Summarize platform subscriptions for monitoring';

    public function handle(): int
    {
        $stats = [
            'tenants_total' => Tenant::query()->count(),
            'tenants_active' => Tenant::query()->where('status', 'active')->count(),
            'tenants_trial' => Tenant::query()
                ->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>=', now())
                ->count(),
            'subscriptions_active' => Subscription::query()->where('status', 'active')->count(),
            'subscriptions_trial' => Subscription::query()->where('status', 'trial')->count(),
            'subscriptions_past_due' => Subscription::query()->where('status', 'past_due')->count(),
            'subscriptions_cancelled' => Subscription::query()->where('status', 'cancelled')->count(),
            'mrr_omr' => round(
                (float) Subscription::query()
                    ->whereIn('status', ['active', 'trial'])
                    ->sum('amount'),
                2
            ),
            'plans' => Plan::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['slug', 'name', 'price_monthly'])
                ->map(fn (Plan $plan) => [
                    'slug' => $plan->slug,
                    'name' => $plan->name,
                    'price_monthly' => (float) $plan->price_monthly,
                    'tenants' => Tenant::query()->where('plan_id', $plan->id)->count(),
                ])
                ->values()
                ->all(),
        ];

        if ($this->option('json')) {
            $this->line(json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } else {
            $this->info('Tammer Wash — Subscription Report');
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total tenants', $stats['tenants_total']],
                    ['Active tenants', $stats['tenants_active']],
                    ['On trial', $stats['tenants_trial']],
                    ['Active subscriptions', $stats['subscriptions_active']],
                    ['Trial subscriptions', $stats['subscriptions_trial']],
                    ['Past due', $stats['subscriptions_past_due']],
                    ['Cancelled', $stats['subscriptions_cancelled']],
                    ['Estimated MRR (OMR)', $stats['mrr_omr']],
                ]
            );

            $this->newLine();
            $this->table(
                ['Plan', 'Slug', 'Monthly (OMR)', 'Tenants'],
                collect($stats['plans'])->map(fn ($plan) => [
                    $plan['name'],
                    $plan['slug'],
                    $plan['price_monthly'],
                    $plan['tenants'],
                ])->all()
            );
        }

        return self::SUCCESS;
    }
}
