import { useQuery } from '@tanstack/react-query';
import { 
    Building2, 
    CreditCard, 
    DollarSign, 
    Users, 
    Activity, 
    Search, 
    Filter, 
    PlusCircle, 
    LayoutGrid, 
    Briefcase,
    Zap,
    Settings,
    ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { StatsCard } from '@/components/common/StatsCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { cn, formatCurrency } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

interface LandlordDashboardStats {
    tenants_total: number;
    tenants_active: number;
    tenants_trial: number;
    tenants_suspended: number;
    subscriptions_active: number;
    subscriptions_trial: number;
    subscriptions_past_due: number;
    mrr: number;
    currency: string;
    plans_breakdown: Array<{
        slug: string;
        name: string;
        price_monthly: number;
        tenants_count: number;
    }>;
}

export function LandlordDashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-dashboard-stats'],
        queryFn: () => api.get<ApiResponse<LandlordDashboardStats>>(endpoints.landlord.dashboardStats),
    });

    const stats = data?.data;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">
                            <Activity className="h-3 w-3 me-1.5" />
                            {t('dashboard.centralOverview')}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">{t('dashboard.landlordTitle')}</h1>
                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                        {t('dashboard.welcomeLandlord')}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
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

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard 
                    title={t('dashboard.tenantsTotal')} 
                    value={stats?.tenants_total ?? 0} 
                    icon={Users} 
                    loading={isLoading}
                />
                <StatsCard 
                    title={t('dashboard.tenantsActive')} 
                    value={stats?.tenants_active ?? 0} 
                    icon={Building2} 
                    loading={isLoading}
                />
                <StatsCard 
                    title={t('dashboard.tenantsTrial')} 
                    value={stats?.tenants_trial ?? 0} 
                    icon={Zap} 
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.mrr')}
                    value={stats?.mrr ?? 0}
                    icon={DollarSign}
                    format="currency"
                    loading={isLoading}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    {/* Quick Actions Card */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-primary text-primary-foreground p-10">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                                    <PlusCircle className="h-7 w-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">{t('dashboard.quickActions')}</CardTitle>
                                    <CardDescription className="text-white/40 font-bold text-sm">{t('dashboard.landlordQuickActionsHint')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                                <DashboardQuickAction 
                                    icon={Building2} 
                                    label={t('dashboard.addTenant')} 
                                    to="/landlord/tenants" 
                                    className="bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={CreditCard} 
                                    label={t('dashboard.subscriptions')} 
                                    to="/landlord/subscriptions" 
                                    className="bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={Briefcase} 
                                    label={t('dashboard.plans')} 
                                    to="/landlord/plans" 
                                    className="bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={Settings} 
                                    label={t('landlord.nav.settings')} 
                                    to="/landlord/settings" 
                                    className="bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plans Breakdown */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <LayoutGrid className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">{t('dashboard.plansBreakdown')}</CardTitle>
                                    <CardDescription className="text-xs font-bold text-muted-foreground mt-1">{t('dashboard.plansBreakdownHint')}</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="font-black text-primary hover:bg-primary/5 rounded-xl px-4">
                                <Link to="/landlord/plans" className="flex items-center gap-1.5">
                                    {t('common.viewAll')}
                                    <ChevronLeft className="h-4 w-4" />
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
                            ) : (stats?.plans_breakdown ?? []).length === 0 ? (
                                <EmptyState
                                    icon={LayoutGrid}
                                    title={t('landlord.plans.emptyTitle')}
                                    description={t('landlord.plans.emptyHint')}
                                    actionLabel={t('landlord.nav.plans')}
                                    actionTo="/landlord/plans"
                                />
                            ) : (
                                <div className="space-y-5">
                                    {(stats?.plans_breakdown ?? []).map((plan) => (
                                        <div key={plan.slug} className="group flex items-center justify-between p-5 rounded-[1.75rem] hover:bg-primary/[0.03] transition-all border border-transparent hover:border-primary/10">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground group-hover:text-primary transition-colors">{plan.name}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                                                        {plan.slug} • {formatCurrency(plan.price_monthly)} {t('dashboard.perMonth')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-primary">{plan.tenants_count} {t('dashboard.tenantCount')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Platform Health/Activity Panel */}
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
                            {stats ? (
                                <>
                                    <LandlordMetricRow
                                        label={t('dashboard.tenantsActive')}
                                        value={`${stats.tenants_active} / ${stats.tenants_total}`}
                                    />
                                    <LandlordMetricRow
                                        label={t('dashboard.subscriptions')}
                                        value={`${stats.subscriptions_active} ${t('common.active').toLowerCase()}`}
                                    />
                                    <LandlordMetricRow
                                        label={t('dashboard.tenantsTrial')}
                                        value={String(stats.tenants_trial)}
                                    />
                                    <LandlordMetricRow
                                        label={t('dashboard.mrr')}
                                        value={formatCurrency(stats.mrr, stats.currency)}
                                    />
                                </>
                            ) : (
                                <EmptyState
                                    icon={Activity}
                                    title={t('common.noData')}
                                    description={t('common.noDataHint')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Tenants/Logs */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black leading-none tracking-tight">{t('dashboard.recentTenants')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-6">
                            <EmptyState
                                icon={Users}
                                title={t('dashboard.recentTenantsEmpty')}
                                description={t('dashboard.recentTenantsEmptyHint')}
                                actionLabel={t('landlord.nav.tenants')}
                                actionTo="/landlord/tenants"
                            />
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

function LandlordMetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border/30 bg-muted/20 px-5 py-4">
            <span className="text-sm font-bold text-muted-foreground">{label}</span>
            <span className="text-lg font-black text-foreground">{value}</span>
        </div>
    );
}
