import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import {
    CalendarDays,
    ClipboardList,
    Crown,
    Banknote,
    Users,
    Activity,
    Car,
    Droplets,
    ListOrdered,
    LayoutDashboard,
    ChevronLeft,
    AlertCircle,
} from 'lucide-react';
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
import { useAuth } from '@/providers/AuthProvider';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { StatsCard } from '@/components/common/StatsCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { t } from '@/lib/i18n';
import type { ApiResponse, DashboardStats } from '@/types/api';
import { formatCurrency, cn, formatNumber } from '@/lib/utils';
import type { PlanFeatureKey } from '@/lib/plan-features';
import type { LucideIcon } from 'lucide-react';

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

function todayLabel(): string {
    return new Date().toLocaleDateString('ar-OM', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const chartTooltipStyle = {
    borderRadius: '0.75rem',
    border: '1px solid var(--inst-border)',
    background: '#ffffff',
    boxShadow: '0 8px 20px color-mix(in srgb, var(--inst-teal) 10%, transparent)',
    padding: '0.75rem 1rem',
    color: 'var(--inst-text)',
};

export function DashboardPage() {
    const { isAuthenticated, isLoading: authLoading, isLandlord } = useAuth();
    const branchParams = useBranchQueryParams();
    const { hasFeature } = usePlanFeatures();

    const { data, isLoading, isError } = useAuthenticatedQuery({
        queryKey: ['dashboard', branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<DashboardStats>>(endpoints.dashboard.stats, branchParams);
            return response.data;
        },
        enabled: isAuthenticated && !isLandlord && !authLoading,
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

    const allShortcuts: Array<{
        to: string;
        label: string;
        icon: LucideIcon;
        feature: PlanFeatureKey;
        primary?: boolean;
    }> = [
        { to: '/cashier', label: t('dashboard.openCashier'), icon: Banknote, feature: 'cashier', primary: true },
        { to: '/orders/create', label: t('dashboard.newOrder'), icon: ClipboardList, feature: 'orders' },
        { to: '/queue', label: t('dashboard.openQueue'), icon: ListOrdered, feature: 'queue' },
        { to: '/booking', label: t('dashboard.openBookings'), icon: CalendarDays, feature: 'bookings' },
    ];
    const shortcuts = allShortcuts.filter((item) => hasFeature(item.feature));

    return (
        <div className="space-y-5">
            <PageHeader
                kicker={t('dashboard.liveOps')}
                title={t('dashboard.commandCenter')}
                description={`${t('dashboard.commandSubtitle')} · ${todayLabel()}`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {plan && (
                            <Badge className="rounded-md border border-inst-border bg-inst-silver px-3 py-1.5 text-[11px] font-bold text-inst-teal">
                                {t('dashboard.plan')}: {formatPlanLabel(plan.plan_slug, plan.plan_name)}
                            </Badge>
                        )}
                        {shortcuts.map((item) => (
                            <Button
                                key={item.to}
                                asChild
                                className={cn(
                                    'h-10 rounded-lg font-bold',
                                    item.primary
                                        ? 'bg-inst-primary text-white hover:bg-inst-teal'
                                        : 'border-inst-border bg-white text-inst-text hover:bg-inst-silver',
                                )}
                                variant={item.primary ? 'default' : 'outline'}
                            >
                                <Link to={item.to}>
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                }
            />

            {isError && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    {t('dashboard.error')}
                </div>
            )}

            {plan && (
                <div className="admin-panel overflow-hidden rounded-xl">
                    <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.14em] text-inst-muted">{t('dashboard.currentPlan')}</p>
                                <p className="mt-0.5 text-base font-bold text-inst-text">{formatPlanLabel(plan.plan_slug, plan.plan_name)}</p>
                            </div>
                            <div className="hidden h-8 w-px bg-inst-border sm:block" />
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.14em] text-inst-muted">{t('dashboard.subscriptionEnds')}</p>
                                <p className="mt-0.5 text-base font-bold text-inst-text">{formatDate(plan.subscription_ends_at)}</p>
                            </div>
                            <div className="hidden h-8 w-px bg-inst-border sm:block" />
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.14em] text-inst-muted">{t('dashboard.daysRemaining')}</p>
                                <p className="mt-0.5 text-base font-bold text-inst-primary">
                                    {plan.days_remaining ?? 0} {t('dashboard.days')}
                                </p>
                            </div>
                            {maxBranches !== null && (
                                <>
                                    <div className="hidden h-8 w-px bg-inst-border sm:block" />
                                    <div className="min-w-[11rem]">
                                        <p className="text-[10px] font-bold tracking-[0.14em] text-inst-muted">
                                            {t('dashboard.branchLimit')}: {branchUsage} / {maxBranches}
                                        </p>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-inst-silver">
                                            <div
                                                className="h-full rounded-full bg-inst-primary"
                                                style={{ width: `${Math.min(100, (branchUsage / (maxBranches || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <Badge
                            className={cn(
                                'rounded-md px-3 py-1 text-[10px] font-bold tracking-wide',
                                plan.subscription_status === 'active'
                                    ? 'bg-inst-success text-white'
                                    : 'border border-inst-border bg-inst-silver text-inst-teal',
                            )}
                        >
                            {formatSubscriptionStatus(plan.subscription_status)}
                        </Badge>
                    </div>
                    {isStarter && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-inst-border bg-inst-silver px-5 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-inst-teal text-white">
                                    <Crown className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-inst-text">{t('dashboard.upgradeTitle')}</p>
                                    <p className="text-xs font-medium text-inst-muted">{t('dashboard.upgradeHint')}</p>
                                </div>
                            </div>
                            <Button asChild className="h-10 rounded-lg bg-inst-primary font-bold text-white hover:bg-inst-teal">
                                <Link to="/settings">{t('dashboard.upgradeCta')}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title={t('dashboard.todayOrders')}
                    value={stats.today_orders}
                    icon={ClipboardList}
                    loading={isLoading}
                    hint={t('dashboard.kpiHint')}
                />
                <StatsCard
                    title={t('dashboard.todayRevenue')}
                    value={stats.today_revenue}
                    icon={Banknote}
                    format="currency"
                    loading={isLoading}
                    hint={t('common.today')}
                />
                <StatsCard
                    title={t('dashboard.queueWaiting')}
                    value={stats.queue_waiting}
                    icon={Users}
                    loading={isLoading}
                    hint={t('nav.queue')}
                />
                <StatsCard
                    title={t('dashboard.activeBookings')}
                    value={stats.active_bookings}
                    icon={CalendarDays}
                    loading={isLoading}
                    hint={t('nav.booking')}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                    <Card className="admin-panel rounded-xl shadow-none">
                        <CardHeader className="border-b border-inst-border px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-inst-text">{t('dashboard.opsShortcuts')}</CardTitle>
                                    <CardDescription className="text-xs font-medium text-inst-muted">{t('dashboard.opsShortcutsHint')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {hasFeature('cashier') && (
                                    <DashboardQuickAction icon={Banknote} label={t('nav.cashier')} to="/cashier" />
                                )}
                                {hasFeature('queue') && (
                                    <DashboardQuickAction icon={ListOrdered} label={t('nav.queue')} to="/queue" />
                                )}
                                {hasFeature('orders') && (
                                    <DashboardQuickAction icon={ClipboardList} label={t('nav.orders')} to="/orders" />
                                )}
                                {hasFeature('vehicles') && (
                                    <DashboardQuickAction icon={Car} label={t('nav.vehicles')} to="/vehicles" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="admin-panel rounded-xl shadow-none">
                            <CardHeader className="border-b border-inst-border px-5 py-4">
                                <CardTitle className="text-base font-bold text-inst-text">{t('dashboard.revenueTrend')}</CardTitle>
                                <CardDescription className="text-xs font-medium text-inst-muted">{t('dashboard.revenueTrendHint')}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 p-4">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-lg" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.revenue_trend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--inst-border)" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--inst-muted)' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--inst-muted)' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="var(--brand-primary)"
                                                strokeWidth={2.5}
                                                dot={{ fill: 'var(--brand-primary)', strokeWidth: 0, r: 3 }}
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: 'var(--inst-aqua)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="admin-panel rounded-xl shadow-none">
                            <CardHeader className="border-b border-inst-border px-5 py-4">
                                <CardTitle className="text-base font-bold text-inst-text">{t('dashboard.ordersByStatus')}</CardTitle>
                                <CardDescription className="text-xs font-medium text-inst-muted">{t('dashboard.ordersByStatusHint')}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 p-4">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-lg" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.orders_by_status}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--inst-border)" vertical={false} />
                                            <XAxis dataKey="status" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--inst-muted)' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--inst-muted)' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={chartTooltipStyle} />
                                            <Bar dataKey="count" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} barSize={36} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4 lg:col-span-4">
                    <Card className="admin-panel rounded-xl shadow-none">
                        <CardHeader className="border-b border-inst-border px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base font-bold text-inst-text">{t('dashboard.platformActivity')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4">
                            {stats.today_orders === 0 &&
                            stats.queue_waiting === 0 &&
                            stats.active_bookings === 0 &&
                            stats.today_revenue === 0 ? (
                                <EmptyState
                                    icon={Activity}
                                    title={t('dashboard.platformActivityEmpty')}
                                    description={t('dashboard.platformActivityHint')}
                                    actionLabel={t('orders.createWalkIn')}
                                    actionTo="/orders"
                                />
                            ) : (
                                <>
                                    <DashboardMetricRow label={t('dashboard.todayOrders')} value={formatNumber(stats.today_orders)} />
                                    <DashboardMetricRow label={t('dashboard.todayRevenue')} value={formatCurrency(stats.today_revenue)} />
                                    <DashboardMetricRow label={t('dashboard.queueWaiting')} value={formatNumber(stats.queue_waiting)} />
                                    <DashboardMetricRow label={t('dashboard.activeBookings')} value={formatNumber(stats.active_bookings)} />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="admin-panel rounded-xl shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-inst-border px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                    <Droplets className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base font-bold text-inst-text">{t('dashboard.topServices')}</CardTitle>
                            </div>
                            {hasFeature('services') && (
                                <Button variant="outline" size="sm" asChild className="h-8 rounded-lg border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver">
                                    <Link to="/services" className="flex items-center gap-1">
                                        {t('common.viewAll')}
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-4">
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : stats.top_services.length === 0 ? (
                                <EmptyState
                                    icon={Droplets}
                                    title={t('dashboard.topServicesEmpty')}
                                    description={t('dashboard.topServicesEmptyHint')}
                                    actionLabel={t('dashboard.topServicesCta')}
                                    actionTo="/services"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {stats.top_services.map((service) => (
                                        <div
                                            key={service.name}
                                            className="flex items-center justify-between rounded-lg border border-inst-border bg-inst-silver/60 px-3 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-inst-teal">
                                                    <Droplets className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-inst-text">{service.name}</p>
                                                    <p className="text-[11px] font-semibold text-inst-muted">
                                                        {service.count} {t('dashboard.ordersCount')}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-inst-primary">{formatCurrency(service.revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DashboardQuickAction({ icon: Icon, label, to }: { icon: LucideIcon; label: string; to: string }) {
    return (
        <Link
            to={to}
            className="group flex items-center gap-3 rounded-lg border border-inst-border bg-inst-silver px-3 py-3 transition-colors hover:border-[var(--brand-primary)] hover:bg-white"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-inst-teal text-white">
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-inst-text group-hover:text-inst-primary">{label}</span>
        </Link>
    );
}

function DashboardMetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-inst-border bg-inst-silver/70 px-4 py-3">
            <span className="text-sm font-semibold text-inst-muted">{label}</span>
            <span className="text-base font-bold text-inst-text">{value}</span>
        </div>
    );
}
