import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ClipboardList, Crown, DollarSign, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, DashboardStats } from '@/types/api';
import { formatCurrency } from '@/lib/utils';

const PLAN_DISPLAY_NAMES: Record<string, string> = {
    starter: 'Starter',
    professional: 'Pro',
    enterprise: 'Enterprise',
};

function formatPlanLabel(slug?: string, name?: string): string {
    if (slug && PLAN_DISPLAY_NAMES[slug]) {
        return PLAN_DISPLAY_NAMES[slug];
    }

    return name ?? '—';
}

function formatSubscriptionStatus(status?: string): string {
    switch (status) {
        case 'trial':
            return t('dashboard.subscriptionStatusTrial');
        case 'active':
            return t('dashboard.subscriptionStatusActive');
        default:
            return t('dashboard.subscriptionStatusInactive');
    }
}

function formatDate(iso?: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleDateString('ar-OM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function DashboardPage() {
    const branchParams = useBranchQueryParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard', branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<DashboardStats>>(endpoints.dashboard.stats, branchParams);
            return response.data;
        },
        retry: false,
    });

    const stats = data ?? {
        today_orders: 0,
        today_revenue: 0,
        queue_waiting: 0,
        active_bookings: 0,
        revenue_trend: [],
        orders_by_status: [],
        top_services: [],
        plan: null,
    };

    const plan = stats.plan;
    const isStarter = plan?.plan_slug === 'starter';
    const maxBranches = plan?.limits.max_branches;
    const branchUsage = plan?.usage.branches ?? 0;

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('dashboard.title')}
                description={t('app.tagline')}
                actions={
                    plan ? (
                        <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                            <Sparkles className="size-3.5" />
                            {formatPlanLabel(plan.plan_slug, plan.plan_name)}
                        </Badge>
                    ) : undefined
                }
            />

            {isError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    تعذّر تحميل بيانات لوحة التحكم — سيتم عرض البيانات عند توفر الـ API.
                </div>
            )}

            {plan && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle className="text-lg">{t('dashboard.subscriptionTitle')}</CardTitle>
                            <Badge variant={plan.subscription_status === 'trial' ? 'outline' : 'default'}>
                                {formatSubscriptionStatus(plan.subscription_status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('dashboard.currentPlan')}</p>
                                <p className="text-lg font-semibold">{formatPlanLabel(plan.plan_slug, plan.plan_name)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('dashboard.subscriptionEnds')}</p>
                                <p className="text-lg font-semibold">{formatDate(plan.subscription_ends_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('dashboard.daysRemaining')}</p>
                                <p className="text-lg font-semibold">
                                    {plan.days_remaining ?? 0} {t('dashboard.days')}
                                </p>
                            </div>
                        </div>

                        {maxBranches !== null && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t('dashboard.branchLimit')}: {branchUsage} / {maxBranches}
                            </p>
                        )}

                        {isStarter && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-primary/30 bg-background/80 p-4">
                                <div className="flex items-start gap-2">
                                    <Crown className="mt-0.5 size-4 text-primary" />
                                    <div>
                                        <p className="font-medium">{t('dashboard.upgradeTitle')}</p>
                                        <p className="text-sm text-muted-foreground">{t('dashboard.upgradeHint')}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="default" asChild>
                                    <Link to="/settings">{t('dashboard.upgradeCta')}</Link>
                                </Button>
                            </div>
                        )}

                        {!plan.can_add_branch && (
                            <p className="mt-3 text-sm text-amber-700">{t('dashboard.branchLimitReached')}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard title={t('dashboard.todayOrders')} value={stats.today_orders} icon={ClipboardList} loading={isLoading} />
                <StatsCard title={t('dashboard.todayRevenue')} value={stats.today_revenue} icon={DollarSign} format="currency" loading={isLoading} />
                <StatsCard title={t('dashboard.queueWaiting')} value={stats.queue_waiting} icon={Users} loading={isLoading} />
                <StatsCard title={t('dashboard.activeBookings')} value={stats.active_bookings} icon={CalendarDays} loading={isLoading} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.revenueTrend')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.revenue_trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.ordersByStatus')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.orders_by_status}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.topServices')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : stats.top_services.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.top_services.map((service) => (
                                <div key={service.name} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="font-medium">{service.name}</p>
                                        <p className="text-sm text-muted-foreground">{service.count} طلب</p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
