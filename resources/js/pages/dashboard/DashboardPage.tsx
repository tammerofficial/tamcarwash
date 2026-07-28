import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ClipboardList, DollarSign, Users } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, DashboardStats } from '@/types/api';
import { formatCurrency } from '@/lib/utils';

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
    };

    return (
        <div className="space-y-6">
            <PageHeader title={t('dashboard.title')} description={t('app.tagline')} />

            {isError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    تعذّر تحميل بيانات لوحة التحكم — سيتم عرض البيانات عند توفر الـ API.
                </div>
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
