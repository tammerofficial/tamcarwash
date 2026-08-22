import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import {
    CalendarDays,
    ClipboardList,
    Crown,
    Banknote,
    Users,
    Droplets,
    ListOrdered,
    LayoutDashboard,
    ChevronLeft,
    AlertCircle,
    Plus,
    TrendingUp,
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, DashboardStats } from '@/types/api';
import { formatCurrency, cn } from '@/lib/utils';
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

    // Primary actions - only 3 most important for non-technical users
    const primaryActions: Array<{
        to: string;
        label: string;
        icon: LucideIcon;
        feature: PlanFeatureKey;
        description: string;
    }> = [
        {
            to: '/cashier',
            label: t('dashboard.openCashier'),
            icon: Banknote,
            feature: 'cashier',
            description: t('dashboard.cashierHint') || 'معالجة الدفع والفواتير',
        },
        {
            to: '/queue',
            label: t('dashboard.openQueue'),
            icon: ListOrdered,
            feature: 'queue',
            description: t('dashboard.queueHint') || 'عرض قائمة الانتظار',
        },
        {
            to: '/orders/create',
            label: t('dashboard.newOrder'),
            icon: Plus,
            feature: 'orders',
            description: t('dashboard.createOrderHint') || 'إضافة طلب جديد',
        },
    ];
    const primaryActionsFiltered = primaryActions.filter((item) => hasFeature(item.feature));

    // Secondary actions - expandable
    const secondaryActions: Array<{
        to: string;
        label: string;
        icon: LucideIcon;
        feature: PlanFeatureKey;
    }> = [
        { to: '/booking', label: t('nav.booking'), icon: CalendarDays, feature: 'bookings' },
        { to: '/customers', label: t('nav.customers'), icon: Users, feature: 'customers' },
        { to: '/services', label: t('nav.services'), icon: Droplets, feature: 'services' },
        { to: '/settings', label: t('nav.settings'), icon: ChevronLeft, feature: 'settings' },
    ];
    const secondaryActionsFiltered = secondaryActions.filter((item) => hasFeature(item.feature));

    return (
        <div className="space-y-6">
            {/* Simplified Header */}
            <div>
                <h1 className="text-3xl font-bold text-inst-text">{t('dashboard.welcome')}</h1>
                <p className="mt-1 text-inst-muted">{todayLabel()}</p>
            </div>

            {/* Error Alert */}
            {isError && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    {t('dashboard.error')}
                </div>
            )}

            {/* Primary Big Action Buttons - Most Important */}
            {primaryActionsFiltered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {primaryActionsFiltered.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="group relative overflow-hidden rounded-2xl border-2 border-inst-primary bg-gradient-to-br from-inst-primary to-inst-teal p-6 transition-all hover:shadow-lg hover:scale-105"
                        >
                            <div className="absolute inset-0 opacity-0 bg-black/5 group-hover:opacity-100 transition-opacity" />
                            <div className="relative space-y-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-white">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{item.label}</h3>
                                    <p className="text-sm text-white/80">{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Plan Status - Simplified */}
            {plan && (
                <div className="rounded-xl border border-inst-border bg-inst-silver/50 p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-inst-muted uppercase">
                                {t('dashboard.currentPlan')}
                            </p>
                            <p className="mt-2 text-xl font-bold text-inst-primary">
                                {formatPlanLabel(plan.plan_slug, plan.plan_name)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-inst-muted uppercase">
                                {t('dashboard.subscriptionEnds')}
                            </p>
                            <p className="mt-2 text-lg font-bold text-inst-text">{formatDate(plan.subscription_ends_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-inst-muted uppercase">
                                {t('dashboard.daysRemaining')}
                            </p>
                            <p className={cn('mt-2 text-lg font-bold', plan.days_remaining! < 7 ? 'text-amber-600' : 'text-inst-success')}>
                                {plan.days_remaining ?? 0} {t('dashboard.days')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Essential Stats - Clear and Large */}
            <div className="space-y-3">
                <h2 className="text-base font-bold text-inst-text">{t('dashboard.todayMetrics')}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SimpleLargeStatsCard
                        title={t('dashboard.todayOrders')}
                        value={stats.today_orders}
                        icon={ClipboardList}
                        loading={isLoading}
                        color="bg-blue-50"
                        textColor="text-blue-600"
                        borderColor="border-blue-200"
                    />
                    <SimpleLargeStatsCard
                        title={t('dashboard.todayRevenue')}
                        value={stats.today_revenue}
                        icon={Banknote}
                        loading={isLoading}
                        format="currency"
                        color="bg-green-50"
                        textColor="text-green-600"
                        borderColor="border-green-200"
                    />
                    <SimpleLargeStatsCard
                        title={t('dashboard.queueWaiting')}
                        value={stats.queue_waiting}
                        icon={Users}
                        loading={isLoading}
                        color="bg-orange-50"
                        textColor="text-orange-600"
                        borderColor="border-orange-200"
                    />
                    <SimpleLargeStatsCard
                        title={t('dashboard.activeBookings')}
                        value={stats.active_bookings}
                        icon={CalendarDays}
                        loading={isLoading}
                        color="bg-purple-50"
                        textColor="text-purple-600"
                        borderColor="border-purple-200"
                    />
                </div>
            </div>

            {/* Charts Section - Only if data exists */}
            {(stats.revenue_trend.length > 0 || stats.orders_by_status.length > 0) && (
                <div className="grid gap-4 lg:grid-cols-2">
                    {stats.revenue_trend.length > 0 && (
                        <Card className="admin-panel rounded-xl shadow-none">
                            <CardHeader className="border-b border-inst-border px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-inst-text">
                                            {t('dashboard.revenueTrend')}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-inst-muted">
                                            {t('dashboard.last7Days')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-80 p-4">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-lg" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.revenue_trend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--inst-border)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--inst-muted)' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--inst-muted)' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="var(--brand-primary)"
                                                strokeWidth={3}
                                                dot={{ fill: 'var(--brand-primary)', strokeWidth: 0, r: 4 }}
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: 'var(--inst-aqua)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {stats.orders_by_status.length > 0 && (
                        <Card className="admin-panel rounded-xl shadow-none">
                            <CardHeader className="border-b border-inst-border px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                        <LayoutDashboard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-inst-text">
                                            {t('dashboard.ordersByStatus')}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-inst-muted">
                                            {t('dashboard.last7Days')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-80 p-4">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-lg" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.orders_by_status}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--inst-border)" vertical={false} />
                                            <XAxis
                                                dataKey="status"
                                                tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--inst-muted)' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--inst-muted)' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip contentStyle={chartTooltipStyle} />
                                            <Bar dataKey="count" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} barSize={48} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Top Services - Simplified */}
            {stats.top_services.length > 0 && (
                <Card className="admin-panel rounded-xl shadow-none">
                    <CardHeader className="border-b border-inst-border px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                                    <Droplets className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-inst-text">
                                        {t('dashboard.topServices')}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium text-inst-muted">
                                        {t('dashboard.mostPopular')}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasFeature('services') && (
                                <Button variant="outline" size="sm" asChild className="h-8 rounded-lg border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver">
                                    <Link to="/services">{t('common.viewAll')}</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.top_services.slice(0, 5).map((service) => (
                                    <div
                                        key={service.name}
                                        className="flex items-center justify-between rounded-xl border border-inst-border bg-inst-silver/60 px-4 py-4 hover:bg-inst-silver transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-inst-teal font-bold">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-inst-text">{service.name}</p>
                                                <p className="text-xs text-inst-muted">
                                                    {service.count} {t('dashboard.ordersCount')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-inst-primary">{formatCurrency(service.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* More Actions - Hidden by default */}
            {secondaryActionsFiltered.length > 0 && (
                <details className="group rounded-xl border border-inst-border bg-inst-silver/30">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-bold text-inst-text hover:bg-inst-silver/50 transition-colors">
                        <span>{t('dashboard.moreActions')}</span>
                        <span className="transition-transform group-open:rotate-180">
                            <ChevronLeft className="h-5 w-5" />
                        </span>
                    </summary>
                    <div className="border-t border-inst-border bg-white p-4">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {secondaryActionsFiltered.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center gap-2 rounded-lg border border-inst-border bg-white p-3 text-center transition-colors hover:bg-inst-silver"
                                >
                                    <item.icon className="h-5 w-5 text-inst-teal" />
                                    <span className="text-sm font-medium text-inst-text">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </details>
            )}

            {/* Upgrade Prompt - Non-intrusive */}
            {isStarter && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Crown className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-blue-900">{t('dashboard.upgradeTitle')}</h3>
                            <p className="mt-1 text-sm text-blue-700">{t('dashboard.upgradeHint')}</p>
                        </div>
                        <Button asChild className="h-10 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700">
                            <Link to="/settings">{t('dashboard.upgradeCta')}</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple, large stats card for non-technical users
function SimpleLargeStatsCard({
    title,
    value,
    icon: Icon,
    loading,
    format,
    color,
    textColor,
    borderColor,
}: {
    title: string;
    value: number;
    icon: LucideIcon;
    loading?: boolean;
    format?: string;
    color: string;
    textColor: string;
    borderColor: string;
}) {
    let displayValue = String(value);
    if (format === 'currency') {
        displayValue = formatCurrency(value);
    }

    return (
        <div className={cn('rounded-xl border-2 p-5 transition-all hover:shadow-md', borderColor, color)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-inst-muted">{title}</p>
                    {loading ? (
                        <Skeleton className="mt-3 h-10 w-20 rounded-lg" />
                    ) : (
                        <p className={cn('mt-3 text-4xl font-bold', textColor)}>{displayValue}</p>
                    )}
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', color, textColor)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
