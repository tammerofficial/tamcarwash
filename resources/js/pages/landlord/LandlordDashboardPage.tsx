import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, DollarSign, Users } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">لوحة المنصة</h2>
                <p className="text-muted-foreground">نظرة عامة على المستأجرين والاشتراكات</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard title="إجمالي المستأجرين" value={stats?.tenants_total ?? 0} icon={Users} />
                <StatsCard title="نشط" value={stats?.tenants_active ?? 0} icon={Building2} />
                <StatsCard title="تجريبي" value={stats?.tenants_trial ?? 0} icon={CreditCard} />
                <StatsCard
                    title="MRR"
                    value={`${stats?.mrr ?? 0} ${stats?.currency ?? 'OMR'}`}
                    icon={DollarSign}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>توزيع الباقات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(stats?.plans_breakdown ?? []).map((plan) => (
                        <div key={plan.slug} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">{plan.slug}</p>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">{plan.tenants_count} مستأجر</p>
                                <p className="text-sm text-muted-foreground">{plan.price_monthly} OMR/شهر</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
