import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { 
    CalendarDays, 
    ClipboardList, 
    Crown, 
    DollarSign, 
    Sparkles, 
    Users, 
    Activity, 
    PlusCircle, 
    Car, 
    Droplets, 
    ListOrdered, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ChevronRight, 
    LayoutGrid 
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
import { StatsCard } from '@/components/common/StatsCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, DashboardStats } from '@/types/api';
import { formatCurrency, cn, formatNumber } from '@/lib/utils';

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
            return t('dashboard.subscriptionStatusTrial') || 'تجريبي';
        case 'active':
            return t('dashboard.subscriptionStatusActive') || 'نشط';
        default:
            return t('dashboard.subscriptionStatusInactive') || 'غير نشط';
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
    const { isAuthenticated, isLoading: authLoading, isLandlord } = useAuth();
    const branchParams = useBranchQueryParams();

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

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Enhanced Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">
                            <Activity className="h-3 w-3 me-1.5" />
                            {t('dashboard.realtimeStats')}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">{t('dashboard.title')}</h1>
                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                        {t('app.tagline')}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {plan && (
                        <Badge variant="secondary" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-primary bg-primary/5 border border-primary/10 font-bold shadow-sm">
                            <Sparkles className="size-4" />
                            <span className="text-[11px] uppercase tracking-wider">{t('dashboard.plan')}:</span>
                            <span className="text-sm">{formatPlanLabel(plan.plan_slug, plan.plan_name)}</span>
                        </Badge>
                    )}
                    <div className="relative group hidden sm:block">
                        <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder={t('common.search') || 'بحث سريع...'}
                            className="h-11 w-64 rounded-xl border border-border/40 bg-white ps-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" 
                        />
                    </div>
                    <Button variant="outline" className="h-11 px-5 rounded-xl border-border/60 font-bold hover:bg-muted/30 shadow-sm bg-white">
                        <Filter className="me-2 h-4 w-4" />
                        {t('common.filter') || 'تصفية'}
                    </Button>
                </div>
            </div>

            {isError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                    <Activity className="h-5 w-5 text-amber-500" />
                    {t('dashboard.error')}
                </div>
            )}

            {plan && (
                <Card className="rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-primary/[0.03] via-white to-white overflow-hidden shadow-xl shadow-primary/5">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="size-5" />
                                </div>
                                <CardTitle className="text-xl font-black">{t('dashboard.subscriptionTitle')}</CardTitle>
                            </div>
                            <Badge variant={plan.subscription_status === 'trial' ? 'outline' : 'default'} className={cn(
                                "rounded-lg px-4 py-1.5 font-black uppercase tracking-widest text-[10px]",
                                plan.subscription_status === 'active' ? "bg-primary text-white" : "border-primary/20 text-primary"
                            )}>
                                {formatSubscriptionStatus(plan.subscription_status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="grid gap-8 sm:grid-cols-3">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60">{t('dashboard.currentPlan')}</p>
                                <p className="text-2xl font-black text-foreground">{formatPlanLabel(plan.plan_slug, plan.plan_name)}</p>
                            </div>
                            <div className="space-y-1 border-s border-border/40 ps-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60">{t('dashboard.subscriptionEnds')}</p>
                                <p className="text-2xl font-black text-foreground">{formatDate(plan.subscription_ends_at)}</p>
                            </div>
                            <div className="space-y-1 border-s border-border/40 ps-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60">{t('dashboard.daysRemaining')}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black text-primary">{plan.days_remaining ?? 0}</p>
                                    <p className="text-xs font-bold text-muted-foreground">{t('dashboard.days')}</p>
                                </div>
                            </div>
                        </div>

                        {maxBranches !== null && (
                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex-1 h-3 rounded-full bg-muted/50 overflow-hidden p-0.5 border border-border/20">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm" 
                                        style={{ width: `${(branchUsage / (maxBranches || 1)) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground whitespace-nowrap uppercase tracking-widest">
                                    {t('dashboard.branchLimit') || 'استهلاك الفروع'}: {branchUsage} / {maxBranches}
                                </p>
                            </div>
                        )}

                        {isStarter && (
                            <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-[2.25rem] border border-dashed border-primary/30 bg-primary/[0.02] p-8 shadow-inner group hover:bg-primary/[0.04] transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                        <Crown className="size-7" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-foreground">{t('dashboard.upgradeTitle')}</p>
                                        <p className="text-sm font-bold text-muted-foreground">{t('dashboard.upgradeHint')}</p>
                                    </div>
                                </div>
                                <Button size="lg" className="rounded-xl font-black shadow-xl shadow-primary/20 px-8 h-12" asChild>
                                    <Link to="/settings" className="flex items-center gap-2">
                                        {t('dashboard.upgradeCta')}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Top Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard 
                    title={t('dashboard.todayOrders')} 
                    value={stats.today_orders} 
                    icon={ClipboardList} 
                    loading={isLoading} 
                />
                <StatsCard 
                    title={t('dashboard.todayRevenue')} 
                    value={stats.today_revenue} 
                    icon={DollarSign} 
                    format="currency" 
                    loading={isLoading} 
                />
                <StatsCard 
                    title={t('dashboard.queueWaiting')} 
                    value={stats.queue_waiting} 
                    icon={Users} 
                    loading={isLoading} 
                />
                <StatsCard 
                    title={t('dashboard.activeBookings')} 
                    value={stats.active_bookings} 
                    icon={CalendarDays} 
                    loading={isLoading} 
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    {/* Quick Actions Panel */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-primary text-primary-foreground p-10">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                                    <PlusCircle className="h-7 w-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">{t('dashboard.quickActions')}</CardTitle>
                                    <CardDescription className="text-white/40 font-bold text-sm">{t('dashboard.actionHint')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                                <DashboardQuickAction 
                                    icon={Car} 
                                    label={t('nav.vehicles')} 
                                    to="/vehicles" 
                                    className="bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={Droplets} 
                                    label={t('nav.services')} 
                                    to="/services" 
                                    className="bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={ListOrdered} 
                                    label={t('nav.queue')} 
                                    to="/queue" 
                                    className="bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={LayoutGrid} 
                                    label={t('nav.dashboard')} 
                                    to="/dashboard" 
                                    className="bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts Grid */}
                    <div className="grid gap-8 lg:grid-cols-2">
                        <Card className="rounded-[2.5rem] border border-border/50 p-10 shadow-sm bg-white group hover:shadow-xl transition-all duration-500">
                            <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">{t('dashboard.revenueTrend')}</CardTitle>
                                    <CardDescription className="text-xs font-bold text-muted-foreground mt-1">{t('dashboard.revenueTrendHint')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="h-72 p-0">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-2xl" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.revenue_trend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: '800', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: '800', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '1rem' }}
                                                formatter={(value: number) => formatCurrency(value)} 
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="revenue" 
                                                stroke="hsl(var(--primary))" 
                                                strokeWidth={4} 
                                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                                                activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border border-border/50 p-10 shadow-sm bg-white group hover:shadow-xl transition-all duration-500">
                            <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">{t('dashboard.ordersByStatus')}</CardTitle>
                                    <CardDescription className="text-xs font-bold text-muted-foreground mt-1">{t('dashboard.ordersByStatusHint')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="h-72 p-0">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-2xl" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.orders_by_status}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="status" tick={{ fontSize: 10, fontWeight: '800', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontWeight: '800', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '1rem' }} />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Activity Panel */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/40 p-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black leading-none tracking-tight">{t('dashboard.platformActivity')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
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

                    {/* Top Services Panel */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black leading-none tracking-tight">{t('dashboard.topServices')}</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="font-black text-primary hover:bg-primary/5 rounded-xl px-4">
                                <Link to="/services" className="flex items-center gap-1.5">
                                    {t('common.viewAll')}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 pt-6">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
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
                                <div className="space-y-5">
                                    {stats.top_services.map((service) => (
                                        <div key={service.name} className="group flex items-center justify-between p-5 rounded-[1.75rem] hover:bg-primary/[0.03] transition-all border border-transparent hover:border-primary/10">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                                                    <Droplets className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground group-hover:text-primary transition-colors">{service.name}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{service.count} {t('dashboard.ordersCount')}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-primary">{formatCurrency(service.revenue)}</p>
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

function DashboardQuickAction({ icon: Icon, label, to, className }: { icon: any; label: string; to: string; className?: string }) {
    return (
        <Link 
            to={to} 
            className="group flex flex-col items-center gap-5 text-center transition-all"
        >
            <div className={cn("flex h-20 w-20 items-center justify-center rounded-[2rem] transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-current/15 border border-transparent hover:border-white/50", className)}>
                <Icon className="h-9 w-9 transition-transform duration-500 group-hover:rotate-12" />
            </div>
            <span className="text-[11px] font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase tracking-wider">{label}</span>
        </Link>
    );
}

function DashboardMetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border/30 bg-muted/20 px-5 py-4">
            <span className="text-sm font-bold text-muted-foreground">{label}</span>
            <span className="text-lg font-black text-foreground">{value}</span>
        </div>
    );
}
