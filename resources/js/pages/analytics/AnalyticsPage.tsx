import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Banknote,
    Clock,
    Users2,
    Activity,
    Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface AnalyticsData {
    executive_summary: {
        today_revenue: number;
        active_customers_today: number;
        queue_depth: number;
        staff_on_duty: number;
        revenue_growth_percent: number;
        last_day_revenue: number;
    };
    revenue_analytics: {
        daily_revenue: Array<{
            date: string;
            revenue: number;
            day_name: string;
        }>;
        revenue_by_service: Array<{
            service_id: number;
            revenue: number;
        }>;
        revenue_by_branch: Array<{
            branch_id: number;
            branch_name: string;
            revenue: number;
        }>;
        revenue_vs_target: {
            actual_revenue: number;
            target_revenue: number;
            percentage_of_target: number;
            variance: number;
        };
        trend_7day: number;
        trend_30day: number;
        trend_90day: number;
    };
    customer_analytics: {
        total_customers: number;
        new_customers_this_month: number;
        repeat_customer_rate: number;
        customer_satisfaction: number;
        top_customers: Array<{
            customer_id: number;
            customer_name: string;
            total_spent: number;
            orders_count: number;
        }>;
        customer_growth: Array<{
            date: string;
            total_customers: number;
        }>;
    };
    operations_analytics: {
        average_wait_time: number;
        queue_efficiency: number;
        service_completion_rate: number;
        peak_hours: Array<{
            hour: string;
            orders: number;
        }>;
        busiest_day_of_week: Array<{
            day: string;
            orders: number;
        }>;
        daily_operations: Array<{
            date: string;
            completed_orders: number;
            pending_orders: number;
            avg_wait_time: number;
        }>;
    };
    financial_reports: {
        daily_revenue_breakdown: Array<{
            date: string;
            revenue: number;
        }>;
        tax_report: {
            total_revenue: number;
            tax_rate: number;
            tax_amount: number;
            net_amount: number;
        };
        payment_method_breakdown: Array<{
            payment_method_id: number;
            total_amount: number;
            transaction_count: number;
        }>;
        outstanding_payments: number;
        profit_analysis: {
            total_revenue: number;
            total_expenses: number;
            total_tax: number;
            gross_profit: number;
            net_profit: number;
            profit_margin: number;
        };
    };
    staff_performance: {
        services_per_staff: Array<{
            staff_id: number;
            staff_name: string;
            services_count: number;
        }>;
        average_rating_per_staff: Array<unknown>;
        staff_efficiency: Array<{
            staff_id: number;
            staff_name: string;
            services_per_hour: number;
        }>;
        attendance_tracking: Array<unknown>;
    };
    loyalty_retention: {
        loyalty_points_distributed: number;
        repeat_visit_rate: number;
        customer_churn_rate: number;
        redemption_rate: number;
    };
}

const KPICard = ({
    title,
    value,
    unit,
    icon: Icon,
    trend,
}: {
    title: string;
    value: number | string;
    unit?: string;
    icon?: React.ReactNode;
    trend?: number;
}) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold mt-2">
                        {typeof value === 'number' ? formatNumber(value) : value}
                        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
                    </p>
                    {trend !== undefined && (
                        <p className={`text-sm mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(trend)}% vs last period
                        </p>
                    )}
                </div>
                <div className="text-gray-300">{Icon}</div>
            </div>
        </CardContent>
    </Card>
);

export function AnalyticsPage() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            const now = new Date();
            const endDate = now.toISOString().split('T')[0];
            let startDate: string;

            switch (dateRange) {
                case 'today':
                    startDate = endDate;
                    break;
                case 'week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - 7);
                    startDate = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    const monthStart = new Date(now);
                    monthStart.setDate(1);
                    startDate = monthStart.toISOString().split('T')[0];
                    break;
                default:
                    startDate = endDate;
            }

            params.append('start_date', startDate);
            params.append('end_date', endDate);

            const branchId = searchParams.get('branch_id');
            if (branchId) {
                params.append('branch_id', branchId);
            }

            const response = await api.get(`/analytics/comprehensive-dashboard?${params.toString()}`);
            if (response && typeof response === 'object' && 'data' in response) {
                const responseData = response as { data: AnalyticsData };
                setData(responseData.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error(t('analytics.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-1/3" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <PageHeader title={t('analytics.title')} description={t('analytics.description')} />
                <div className="mt-8 text-center">
                    <p className="text-gray-500">{t('analytics.noData')}</p>
                </div>
            </div>
        );
    }

    const summary = data.executive_summary;
    const revenue = data.revenue_analytics;
    const customers = data.customer_analytics;
    const operations = data.operations_analytics;
    const financial = data.financial_reports;
    const staff = data.staff_performance;
    const loyalty = data.loyalty_retention;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <PageHeader title={t('analytics.title')} description={t('analytics.description')} />

            {/* Date Range Selector */}
            <div className="mt-6 flex gap-2">
                {(['today', 'week', 'month'] as const).map((range) => (
                    <Button
                        key={range}
                        variant={dateRange === range ? 'default' : 'outline'}
                        onClick={() => setDateRange(range)}
                        size="sm"
                    >
                        {t(`analytics.dateRange.${range}`)}
                    </Button>
                ))}
            </div>

            {/* Executive Summary */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.executiveSummary')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KPICard
                        title={t('analytics.metrics.todayRevenue')}
                        value={formatCurrency(summary.today_revenue)}
                        icon={<Banknote size={24} />}
                        trend={summary.revenue_growth_percent}
                    />
                    <KPICard
                        title={t('analytics.metrics.activeCustomersToday')}
                        value={summary.active_customers_today}
                        icon={<Users size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.queueDepth')}
                        value={summary.queue_depth}
                        unit={t('analytics.units.customers')}
                        icon={<Users2 size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.staffOnDuty')}
                        value={summary.staff_on_duty}
                        icon={<Activity size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.revenueGrowth')}
                        value={`${summary.revenue_growth_percent}%`}
                        icon={<TrendingUp size={24} />}
                    />
                </div>
            </div>

            {/* Revenue Analytics */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.dailyRevenue')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenue.daily_revenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name={t('analytics.metrics.revenue')} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.revenueVsTarget')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.actualRevenue')}</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(revenue.revenue_vs_target.actual_revenue)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.targetRevenue')}</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(revenue.revenue_vs_target.target_revenue)}</p>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(revenue.revenue_vs_target.percentage_of_target, 100)}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {revenue.revenue_vs_target.percentage_of_target}% {t('analytics.metrics.ofTarget')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trends */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('analytics.trends.sevenDay')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${revenue.trend_7day >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenue.trend_7day > 0 ? '+' : ''}
                            {revenue.trend_7day.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('analytics.trends.thirtyDay')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${revenue.trend_30day >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenue.trend_30day > 0 ? '+' : ''}
                            {revenue.trend_30day.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('analytics.trends.ninetyDay')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${revenue.trend_90day >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenue.trend_90day > 0 ? '+' : ''}
                            {revenue.trend_90day.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Analytics */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.customerAnalytics')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KPICard
                        title={t('analytics.metrics.totalCustomers')}
                        value={customers.total_customers}
                        icon={<Users size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.newCustomersThisMonth')}
                        value={customers.new_customers_this_month}
                        icon={<Award size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.repeatCustomerRate')}
                        value={customers.repeat_customer_rate.toFixed(1)}
                        unit="%"
                        icon={<TrendingUp size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.customerSatisfaction')}
                        value={customers.customer_satisfaction.toFixed(1)}
                        unit="/ 5"
                        icon={<Award size={24} />}
                    />
                </div>
            </div>

            {/* Customer Growth Chart */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.customerGrowth')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={customers.customer_growth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total_customers" stroke="#8b5cf6" name={t('analytics.metrics.totalCustomers')} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.topCustomers')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {customers.top_customers.map((customer, index) => (
                                <div key={customer.customer_id} className="flex justify-between items-center pb-2 border-b">
                                    <div>
                                        <p className="font-medium">
                                            {index + 1}. {customer.customer_name}
                                        </p>
                                        <p className="text-xs text-gray-500">{customer.orders_count} orders</p>
                                    </div>
                                    <p className="font-bold">{formatCurrency(customer.total_spent)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Operations Analytics */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.operationsAnalytics')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KPICard
                        title={t('analytics.metrics.averageWaitTime')}
                        value={operations.average_wait_time.toFixed(1)}
                        unit={t('analytics.units.minutes')}
                        icon={<Clock size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.queueEfficiency')}
                        value={operations.queue_efficiency.toFixed(1)}
                        unit={t('analytics.units.perHour')}
                        icon={<Activity size={24} />}
                    />
                    <KPICard
                        title={t('analytics.metrics.serviceCompletionRate')}
                        value={operations.service_completion_rate.toFixed(1)}
                        unit="%"
                        icon={<TrendingUp size={24} />}
                    />
                </div>
            </div>

            {/* Operations Charts */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.peakHours')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={operations.peak_hours}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#ec4899" name={t('analytics.metrics.orders')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.busiestDay')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={operations.busiest_day_of_week}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#10b981" name={t('analytics.metrics.orders')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Reports */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.financialReports')}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics.metrics.totalRevenue')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-600">{formatCurrency(financial.tax_report.total_revenue)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics.metrics.grossProfit')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(financial.profit_analysis.gross_profit)}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {t('analytics.metrics.tax')}: {formatCurrency(financial.tax_report.tax_amount)} ({financial.tax_report.tax_rate}%)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics.metrics.netProfit')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-purple-600">{formatCurrency(financial.profit_analysis.net_profit)}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {t('analytics.metrics.profitMargin')}: {financial.profit_analysis.profit_margin.toFixed(1)}%
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Daily Revenue Breakdown */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.charts.dailyRevenueBreakdown')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financial.daily_revenue_breakdown}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="revenue" fill="#06b6d4" name={t('analytics.metrics.revenue')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Performance */}
            {staff.services_per_staff && staff.services_per_staff.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.staffPerformance')}</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics.charts.servicesPerStaff')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={staff.services_per_staff}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="staff_name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="services_count" fill="#f59e0b" name={t('analytics.metrics.servicesCount')} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Loyalty & Retention */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">{t('analytics.sections.loyaltyRetention')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KPICard
                        title={t('analytics.metrics.loyaltyPointsDistributed')}
                        value={loyalty.loyalty_points_distributed}
                        unit={t('analytics.units.points')}
                    />
                    <KPICard
                        title={t('analytics.metrics.repeatVisitRate')}
                        value={loyalty.repeat_visit_rate.toFixed(1)}
                        unit="%"
                    />
                    <KPICard
                        title={t('analytics.metrics.customerChurnRate')}
                        value={loyalty.customer_churn_rate.toFixed(1)}
                        unit="%"
                    />
                    <KPICard
                        title={t('analytics.metrics.redemptionRate')}
                        value={loyalty.redemption_rate.toFixed(1)}
                        unit="%"
                    />
                </div>
            </div>
        </div>
    );
}
