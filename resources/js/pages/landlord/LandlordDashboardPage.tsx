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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
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
                            {t('dashboard.centralOverview') || 'نظرة عامة على المنصة'}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">لوحة إدارة المنصة</h1>
                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                        {t('dashboard.welcomeLandlord') || 'أهلاً بك في وحدة التحكم المركزية لـ Tammer Wash'}
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
                    title="إجمالي المستأجرين" 
                    value={stats?.tenants_total ?? 0} 
                    icon={Users} 
                    loading={isLoading}
                    trend="+5 هذا الشهر"
                />
                <StatsCard 
                    title="المستأجرون النشطون" 
                    value={stats?.tenants_active ?? 0} 
                    icon={Building2} 
                    loading={isLoading}
                    trend="85% من الإجمالي"
                />
                <StatsCard 
                    title="فترات تجريبية" 
                    value={stats?.tenants_trial ?? 0} 
                    icon={Zap} 
                    loading={isLoading}
                    trend="تتطلب متابعة"
                />
                <StatsCard
                    title="MRR (الإيرادات الشهرية)"
                    value={stats?.mrr ?? 0}
                    icon={DollarSign}
                    format="currency"
                    loading={isLoading}
                    trend="+12% نمو"
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
                                    <CardTitle className="text-2xl font-black tracking-tight">إجراءات سريعة</CardTitle>
                                    <CardDescription className="text-white/40 font-bold text-sm">إدارة المستأجرين والخطط والمنصة بفعالية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                                <DashboardQuickAction 
                                    icon={Building2} 
                                    label="إضافة مستأجر" 
                                    to="/landlord/tenants" 
                                    className="bg-primary/5 text-primary hover:bg-primary hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={CreditCard} 
                                    label="الاشتراكات" 
                                    to="/landlord/subscriptions" 
                                    className="bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={Briefcase} 
                                    label="الباقات" 
                                    to="/landlord/plans" 
                                    className="bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white"
                                />
                                <DashboardQuickAction 
                                    icon={Settings} 
                                    label="الإعدادات" 
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
                                    <CardTitle className="text-xl font-black tracking-tight">توزيع الباقات</CardTitle>
                                    <CardDescription className="text-xs font-bold text-muted-foreground mt-1">توزيع المستأجرين حسب باقات الاشتراك</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="font-black text-primary hover:bg-primary/5 rounded-xl px-4">
                                <Link to="/landlord/plans" className="flex items-center gap-1.5">
                                    {t('common.viewAll') || 'عرض الكل'}
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
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{plan.slug} • {plan.price_monthly} OMR/شهر</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-primary">{plan.tenants_count} مستأجر</p>
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
                                <CardTitle className="text-xl font-black leading-none tracking-tight">نشاط المنصة</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <DashboardChartBar label="المستأجرون النشطون" value={85} color="bg-primary" />
                            <DashboardChartBar label="استخدام الـ API" value={62} color="bg-emerald-500" />
                            <DashboardChartBar label="حمل النظام" value={18} color="bg-orange-500" />
                            <DashboardChartBar label="الاشتراكات الجديدة" value={45} color="bg-indigo-500" />
                        </CardContent>
                    </Card>

                    {/* Recent Tenants/Logs */}
                    <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black leading-none tracking-tight">آخر المستأجرين</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-6">
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30 border-2 border-dashed border-border">
                                    <Users className="h-10 w-10" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">سيتم عرض قائمة المستأجرين الجدد هنا</p>
                                </div>
                            </div>
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

function DashboardChartBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                <span>{label}</span>
                <span className="text-foreground">{value}%</span>
            </div>
            <div className="h-3.5 w-full rounded-full bg-muted/30 overflow-hidden border border-border/20 shadow-inner p-[3px]">
                <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", color)} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
