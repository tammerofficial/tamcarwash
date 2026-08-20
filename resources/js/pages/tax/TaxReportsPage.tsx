import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, TaxReportBreakdownItem, TaxReportDetail } from '@/types/api';
import { DollarSign, Receipt, TrendingDown, TrendingUp } from 'lucide-react';

type Period = 'daily' | 'monthly' | 'quarterly';

const PERIOD_ENDPOINTS: Record<Period, string> = {
    daily: endpoints.taxReportsDaily,
    monthly: endpoints.taxReportsMonthly,
    quarterly: endpoints.taxReportsQuarterly,
};

export function TaxReportsPage() {
    const [period, setPeriod] = useState<Period>('monthly');
    const branchParams = useBranchQueryParams();

    const { data: report, isLoading } = useQuery({
        queryKey: ['tax-reports', period, branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TaxReportDetail>>(PERIOD_ENDPOINTS[period], branchParams);
            return response.data;
        },
        retry: false,
    });

    const { data: breakdown = [], isLoading: breakdownLoading } = useQuery({
        queryKey: ['tax-reports-breakdown', report?.from, report?.to, branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<{ items: TaxReportBreakdownItem[] }>>(
                endpoints.taxReportsBreakdown,
                {
                    from: report!.from,
                    to: report!.to,
                    ...branchParams,
                },
            );
            return response.data.items;
        },
        enabled: Boolean(report?.from && report?.to),
        retry: false,
    });

    const summary = report?.summary ?? {
        invoice_count: 0,
        taxable_sales: 0,
        exempt_sales: 0,
        vat_collected: 0,
        vat_on_expenses: 0,
        net_vat_due: 0,
        payments_received: 0,
    };

    const chartData = useMemo(
        () =>
            breakdown.map((row) => ({
                date: row.date.slice(5),
                taxable_sales: row.taxable_sales,
                vat_collected: row.vat_collected,
            })),
        [breakdown],
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('taxReports.title')}
                description={t('taxReports.subtitle')}
                actions={
                    <Button variant="outline" disabled>
                        <Download className="h-4 w-4" />
                        {t('common.export')}
                    </Button>
                }
            />

            <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <TabsList>
                    <TabsTrigger value="daily">{t('taxReports.daily')}</TabsTrigger>
                    <TabsTrigger value="monthly">{t('taxReports.monthly')}</TabsTrigger>
                    <TabsTrigger value="quarterly">{t('taxReports.quarterly')}</TabsTrigger>
                </TabsList>

                <TabsContent value={period} className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <StatsCard
                            title={t('taxReports.taxableSales')}
                            value={summary.taxable_sales}
                            icon={TrendingUp}
                            format="currency"
                            loading={isLoading}
                        />
                        <StatsCard
                            title={t('taxReports.exemptSales')}
                            value={summary.exempt_sales}
                            icon={Receipt}
                            format="currency"
                            loading={isLoading}
                        />
                        <StatsCard
                            title={t('taxReports.vatCollected')}
                            value={summary.vat_collected}
                            icon={DollarSign}
                            format="currency"
                            loading={isLoading}
                        />
                        <StatsCard
                            title={t('taxReports.vatOnExpenses')}
                            value={summary.vat_on_expenses}
                            icon={TrendingDown}
                            format="currency"
                            loading={isLoading}
                        />
                        <StatsCard
                            title={t('taxReports.netVatDue')}
                            value={summary.net_vat_due}
                            icon={DollarSign}
                            format="currency"
                            loading={isLoading}
                        />
                        <StatsCard
                            title={t('taxReports.invoiceCount')}
                            value={summary.invoice_count}
                            icon={Receipt}
                            loading={isLoading}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('taxReports.chartTitle')}</CardTitle>
                            {report && (
                                <p className="text-sm text-muted-foreground">
                                    {report.from} — {report.to}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="h-80">
                            {isLoading || breakdownLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : chartData.length === 0 ? (
                                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    {t('common.noData')}
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar
                                            dataKey="taxable_sales"
                                            name={t('taxReports.taxableSales')}
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="vat_collected"
                                            name={t('taxReports.vatCollected')}
                                            fill="hsl(var(--chart-2, 142 76% 36%))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('taxReports.periodSummary')} — {report?.period ?? period}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.taxableSales')}</span>
                                <span className="font-semibold">{formatCurrency(summary.taxable_sales)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.exemptSales')}</span>
                                <span className="font-semibold">{formatCurrency(summary.exempt_sales)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.vatCollected')}</span>
                                <span className="font-semibold">{formatCurrency(summary.vat_collected)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.vatOnExpenses')}</span>
                                <span className="font-semibold">{formatCurrency(summary.vat_on_expenses)}</span>
                            </div>
                            <div className="flex justify-between pt-2 text-lg">
                                <span className="font-bold">{t('taxReports.netVatDue')}</span>
                                <span className="font-bold text-primary">{formatCurrency(summary.net_vat_due)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
